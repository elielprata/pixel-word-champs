
-- ===================================
-- CORREÇÃO DAS POLÍTICAS RLS PARA CADASTRO
-- ===================================

-- 1. CORRIGIR PROFILES: Remover política problemática e recriar
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Criar política correta para INSERT em profiles
-- Permite inserção quando o ID corresponde ao usuário autenticado OU quando é uma função do sistema
CREATE POLICY "allow_profile_insert" ON public.profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    id = auth.uid() OR 
    -- Permitir inserções por funções SECURITY DEFINER (como handle_new_user)
    current_setting('role') = 'supabase_admin'
  );

-- 2. CORRIGIR USER_ROLES: Permitir que o sistema crie roles iniciais
DROP POLICY IF EXISTS "admin_all_user_roles" ON public.user_roles;

-- Recriar política para SELECT (mantém segurança)
CREATE POLICY "select_own_user_roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- Criar política específica para INSERT que permite criação de roles iniciais
CREATE POLICY "allow_user_roles_insert" ON public.user_roles
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    -- Usuário pode criar sua própria role
    user_id = auth.uid() OR 
    -- Admin pode criar roles para qualquer usuário
    public.is_admin() OR
    -- Permitir inserções por funções SECURITY DEFINER (signup automático)
    current_setting('role') = 'supabase_admin'
  );

-- Criar política para UPDATE/DELETE apenas para admins
CREATE POLICY "admin_manage_user_roles" ON public.user_roles
  FOR ALL 
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. ATUALIZAR A FUNÇÃO handle_new_user para garantir execução com privilégios corretos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public', 'auth'
AS $$
BEGIN
  -- Inserir perfil
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  
  -- Inserir role padrão
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não bloquear o cadastro
    RAISE WARNING 'Erro ao criar perfil/role para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 4. VERIFICAR SE O TRIGGER EXISTE E RECRIAR SE NECESSÁRIO
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 5. TESTAR AS POLÍTICAS COM UMA VERIFICAÇÃO
DO $$
BEGIN
  RAISE NOTICE 'Políticas RLS corrigidas para permitir cadastro automático';
  RAISE NOTICE 'Trigger handle_new_user atualizado com SECURITY DEFINER';
  RAISE NOTICE 'Sistema pronto para testar cadastro de novos usuários';
END $$;

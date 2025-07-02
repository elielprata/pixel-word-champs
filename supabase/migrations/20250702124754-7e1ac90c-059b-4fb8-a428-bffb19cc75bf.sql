-- ===================================
-- CORREÇÃO COMPLETA DAS POLÍTICAS RLS DA TABELA PROFILES
-- Remove políticas conflitantes e implementa versões otimizadas
-- ===================================

-- 1. REMOVER TODAS AS POLÍTICAS RLS EXISTENTES DA TABELA PROFILES
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
DROP POLICY IF EXISTS "allow_profile_insert" ON public.profiles;
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admins_manage_all_profiles" ON public.profiles;

-- 2. CRIAR POLÍTICAS RLS OTIMIZADAS E SIMPLIFICADAS
-- Usar (SELECT auth.uid()) conforme recomendação do Supabase para performance

-- Política para SELECT: Acesso público para todos (necessário para rankings)
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT 
  TO authenticated
  USING (true);

-- Política para INSERT: Apenas o próprio usuário pode criar seu perfil
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

-- Política para UPDATE: Apenas o próprio usuário pode editar seu perfil
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE 
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- Política para DELETE: Apenas usuários com role admin podem deletar
CREATE POLICY "profiles_delete_admin" ON public.profiles
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- 3. VERIFICAR SE O TRIGGER handle_new_user ESTÁ FUNCIONANDO
-- Recriar a função com SECURITY DEFINER para garantir permissões adequadas
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public', 'auth'
AS $$
BEGIN
  -- Inserir perfil automaticamente
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

-- 5. LOG DE CONFIRMAÇÃO
DO $$
BEGIN
  RAISE NOTICE 'Políticas RLS da tabela profiles corrigidas com sucesso';
  RAISE NOTICE 'Usando (SELECT auth.uid()) para otimização de performance';
  RAISE NOTICE 'Trigger handle_new_user recriado com SECURITY DEFINER';
  RAISE NOTICE 'Sistema pronto para resolver erro HTTP 406';
END $$;
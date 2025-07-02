-- ===================================
-- CORREÇÃO FINAL DAS POLÍTICAS RLS PARA PROFILES
-- ===================================

-- 1. REMOVER TODAS AS POLÍTICAS CONFLITANTES DA TABELA PROFILES
DROP POLICY IF EXISTS "profiles_unified_policy" ON public.profiles;
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admins_manage_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_profile_insert" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- 2. CRIAR POLÍTICAS SIMPLES E FUNCIONAIS

-- Política para SELECT: Todos podem ver todos os perfis (dados públicos do ranking)
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para INSERT: Usuários podem criar apenas seu próprio perfil
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Política para UPDATE: Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Política para DELETE: Apenas admins podem deletar perfis (se necessário)
CREATE POLICY "profiles_delete_admin" ON public.profiles
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- 3. GARANTIR QUE O TRIGGER DE CRIAÇÃO AUTOMÁTICA ESTÁ FUNCIONANDO
-- Verificar se a função handle_new_user existe e recriar se necessário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public', 'auth'
AS $$
BEGIN
  -- Log para debug
  RAISE NOTICE 'Criando perfil para usuário: %', NEW.id;
  
  -- Inserir perfil com dados básicos
  INSERT INTO public.profiles (id, username, total_score, games_played, experience_points)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    0,
    0,
    0
  );
  
  -- Inserir role padrão se não existir
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE NOTICE 'Perfil criado com sucesso para usuário: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não bloquear o cadastro
    RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 4. GARANTIR QUE O TRIGGER EXISTE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 5. VERIFICAÇÃO FINAL
DO $$
BEGIN
  RAISE NOTICE 'Políticas RLS da tabela profiles simplificadas com sucesso!';
  RAISE NOTICE 'Trigger de criação automática de perfis reconfigurado!';
  RAISE NOTICE 'Sistema pronto para teste de autenticação e criação de perfis!';
END $$;
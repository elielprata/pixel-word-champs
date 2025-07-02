-- ROLLBACK COMPLETO DAS POLÍTICAS RLS DA TABELA PROFILES
-- Remove todas as políticas RLS atuais e restaura as políticas originais

-- 1. REMOVER TODAS AS POLÍTICAS RLS ATUAIS DA TABELA PROFILES
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_profile_insert" ON public.profiles;

-- 2. RECRIAR POLÍTICAS RLS ORIGINAIS SIMPLES E COMPATÍVEIS
-- Política para visualização (pública para todos os perfis)
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT 
  TO authenticated
  USING (true);

-- Política para inserção (apenas próprio perfil)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Política para atualização (apenas próprio perfil)
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE 
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 3. RESTAURAR TRIGGER HANDLE_NEW_USER PARA ESTADO ORIGINAL
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
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

-- 5. COMENTÁRIO DE CONFIRMAÇÃO
COMMENT ON TABLE public.profiles IS 'Rollback das políticas RLS da tabela profiles executado - compatível com código revertido';
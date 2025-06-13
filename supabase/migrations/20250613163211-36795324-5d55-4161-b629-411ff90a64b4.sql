
-- ===================================
-- RECRIAR TRIGGER PARA CADASTRO AUTOMÁTICO
-- ===================================

-- 1. Verificar se a função handle_new_user existe e está correta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public', 'auth'
AS $$
BEGIN
  -- Log para debug
  RAISE NOTICE 'Trigger handle_new_user executado para usuário: %', NEW.id;
  
  -- Inserir perfil
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  
  -- Inserir role padrão
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RAISE NOTICE 'Perfil e role criados com sucesso para usuário: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não bloquear o cadastro
    RAISE WARNING 'Erro ao criar perfil/role para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 2. Remover trigger existente se houver
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Criar o trigger corretamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Verificar usuários existentes sem perfil e criar perfis para eles
DO $$
DECLARE
  user_record RECORD;
  users_fixed INTEGER := 0;
BEGIN
  -- Buscar usuários que não têm perfil
  FOR user_record IN 
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
  LOOP
    BEGIN
      -- Criar perfil para usuário existente
      INSERT INTO public.profiles (id, username)
      VALUES (
        user_record.id, 
        COALESCE(user_record.raw_user_meta_data->>'username', split_part(user_record.email, '@', 1))
      );
      
      -- Criar role se não existir
      INSERT INTO public.user_roles (user_id, role)
      VALUES (user_record.id, 'user')
      ON CONFLICT (user_id, role) DO NOTHING;
      
      users_fixed := users_fixed + 1;
      RAISE NOTICE 'Perfil criado para usuário existente: %', user_record.email;
      
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Erro ao criar perfil para usuário existente %: %', user_record.email, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Correção concluída. % usuários corrigidos.', users_fixed;
END $$;

-- 5. Verificação final
SELECT 
  'VERIFICAÇÃO FINAL' as status,
  COUNT(DISTINCT au.id) as total_users_auth,
  COUNT(DISTINCT p.id) as total_profiles,
  COUNT(DISTINCT ur.user_id) as total_user_roles
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
LEFT JOIN public.user_roles ur ON au.id = ur.user_id;

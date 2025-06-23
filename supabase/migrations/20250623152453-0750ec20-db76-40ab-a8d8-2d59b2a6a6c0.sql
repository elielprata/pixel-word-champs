
-- Adicionar constraint UNIQUE para username na tabela profiles
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- Criar função para verificar disponibilidade de username e email
CREATE OR REPLACE FUNCTION public.check_user_availability(
  check_username TEXT DEFAULT NULL,
  check_email TEXT DEFAULT NULL
) 
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  username_exists BOOLEAN := false;
  email_exists BOOLEAN := false;
  result jsonb;
BEGIN
  -- Verificar se username já existe (se fornecido)
  IF check_username IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM profiles WHERE LOWER(username) = LOWER(check_username)
    ) INTO username_exists;
  END IF;
  
  -- Verificar se email já existe (se fornecido)
  IF check_email IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM auth.users WHERE email = check_email
    ) INTO email_exists;
  END IF;
  
  -- Retornar resultado como JSON
  result := jsonb_build_object(
    'username_available', NOT username_exists,
    'email_available', NOT email_exists,
    'username_exists', username_exists,
    'email_exists', email_exists
  );
  
  RETURN result;
END;
$$;

-- Dar permissão para usuários autenticados executarem a função
GRANT EXECUTE ON FUNCTION public.check_user_availability(TEXT, TEXT) TO authenticated;

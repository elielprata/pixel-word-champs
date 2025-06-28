
-- Atualizar função para incluir verificação de telefone
CREATE OR REPLACE FUNCTION public.check_user_availability(
  check_username TEXT DEFAULT NULL,
  check_email TEXT DEFAULT NULL,
  check_phone TEXT DEFAULT NULL
) 
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  username_exists BOOLEAN := false;
  email_exists BOOLEAN := false;
  phone_exists BOOLEAN := false;
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
  
  -- Verificar se telefone já existe (se fornecido)
  IF check_phone IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM profiles WHERE phone = check_phone
    ) INTO phone_exists;
  END IF;
  
  -- Retornar resultado como JSON
  result := jsonb_build_object(
    'username_available', NOT username_exists,
    'email_available', NOT email_exists,
    'phone_available', NOT phone_exists,
    'username_exists', username_exists,
    'email_exists', email_exists,
    'phone_exists', phone_exists
  );
  
  RETURN result;
END;
$$;

-- Adicionar campo phone à tabela profiles se não existir
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone character varying;

-- Criar índice para otimizar buscas por telefone
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone) WHERE phone IS NOT NULL;

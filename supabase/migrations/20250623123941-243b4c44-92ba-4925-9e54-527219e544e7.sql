
-- Criar schema para extensões se não existir
CREATE SCHEMA IF NOT EXISTS extensions;

-- Mover a extensão pg_net do schema public para extensions
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- Garantir que a extensão seja acessível para funções que precisam dela
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT USAGE ON SCHEMA extensions TO postgres;

-- Comentário para documentar a mudança
COMMENT ON SCHEMA extensions IS 'Schema dedicado para extensões do PostgreSQL por motivos de segurança';

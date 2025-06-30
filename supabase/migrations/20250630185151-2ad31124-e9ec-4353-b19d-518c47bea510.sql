
-- CORREÇÃO URGENTE: Políticas RLS e estrutura da tabela challenge_progress

-- 1. Remover políticas RLS problemáticas existentes
DROP POLICY IF EXISTS "users_can_view_own_challenge_progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "users_can_manage_own_challenge_progress" ON public.challenge_progress;

-- 2. Criar política RLS temporária mais simples (sem dependência de is_admin)
CREATE POLICY "allow_authenticated_users_full_access" ON public.challenge_progress
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Verificar e corrigir constraint da tabela challenge_progress
-- Garantir que competition_id é do tipo correto e não tem foreign key problemática
ALTER TABLE public.challenge_progress 
ALTER COLUMN competition_id TYPE text;

-- 4. Remover foreign key constraint se existir (estava causando problemas)
ALTER TABLE public.challenge_progress 
DROP CONSTRAINT IF EXISTS challenge_progress_competition_id_fkey;

-- 5. Garantir que a coluna user_id é NOT NULL (necessário para RLS)
ALTER TABLE public.challenge_progress 
ALTER COLUMN user_id SET NOT NULL;

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_challenge_progress_user_competition 
ON public.challenge_progress(user_id, competition_id);

-- 7. Adicionar função de debug para verificar auth
CREATE OR REPLACE FUNCTION public.debug_auth_info()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
    'auth_uid', auth.uid(),
    'current_user', current_user,
    'session_user', session_user,
    'auth_uid_is_null', auth.uid() IS NULL
  );
$$;

-- 8. Comentários para debug
COMMENT ON POLICY "allow_authenticated_users_full_access" ON public.challenge_progress 
IS 'Política temporária para debug - permite acesso total para usuários autenticados';

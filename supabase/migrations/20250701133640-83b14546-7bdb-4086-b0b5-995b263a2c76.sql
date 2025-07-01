
-- CORREÇÃO COMPLETA DAS POLÍTICAS RLS DA TABELA challenge_progress
-- Remove políticas conflitantes e cria uma estrutura limpa e funcional

-- 1. Remover TODAS as políticas existentes que podem estar em conflito
DROP POLICY IF EXISTS "allow_authenticated_users_full_access" ON public.challenge_progress;
DROP POLICY IF EXISTS "challenge_progress_user_optimized" ON public.challenge_progress;
DROP POLICY IF EXISTS "users_can_view_own_challenge_progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "users_can_manage_own_challenge_progress" ON public.challenge_progress;

-- 2. Criar políticas simples e funcionais
-- Usuários podem ler seus próprios progressos
CREATE POLICY "users_read_own_challenge_progress" ON public.challenge_progress
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

-- Usuários podem inserir seus próprios progressos
CREATE POLICY "users_insert_own_challenge_progress" ON public.challenge_progress
  FOR INSERT 
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Usuários podem atualizar seus próprios progressos
CREATE POLICY "users_update_own_challenge_progress" ON public.challenge_progress
  FOR UPDATE 
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins podem fazer tudo (policy separada sem dependência de is_admin para evitar recursão)
CREATE POLICY "admins_manage_all_challenge_progress" ON public.challenge_progress
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Remover função de debug se não for mais necessária
DROP FUNCTION IF EXISTS public.debug_auth_info();

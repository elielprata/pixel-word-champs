
-- SISTEMA RLS SIMPLIFICADO: USUÁRIOS NORMAIS vs ADMINISTRADORES (CORRIGIDO)

-- 1. CRIAR FUNÇÃO SEGURA PARA VERIFICAR SE USUÁRIO É ADMIN
-- Esta função evita recursão e é otimizada para performance
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. USER_ROLES: Remover políticas atuais e criar versão simplificada
DROP POLICY IF EXISTS "view_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "manage_own_roles" ON public.user_roles;

-- Usuários podem ver suas próprias roles
CREATE POLICY "users_view_own_roles" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins podem gerenciar todas as roles
CREATE POLICY "admins_manage_all_roles" ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. PROFILES: Criar políticas simplificadas
-- Usuários podem ver/editar apenas seu próprio perfil
CREATE POLICY "users_manage_own_profile" ON public.profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins podem ver/editar todos os perfis
CREATE POLICY "admins_manage_all_profiles" ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- 4. GAME_SESSIONS: Usuários só veem suas próprias sessões, admins veem tudo
DROP POLICY IF EXISTS "users_own_sessions_select" ON public.game_sessions;
DROP POLICY IF EXISTS "users_own_sessions_insert" ON public.game_sessions;
DROP POLICY IF EXISTS "users_own_sessions_update" ON public.game_sessions;
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.game_sessions;

CREATE POLICY "users_manage_own_sessions" ON public.game_sessions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- 5. COMPETITION_PARTICIPATIONS: Usuários só veem suas participações, admins veem tudo
DROP POLICY IF EXISTS "users_own_participations_select" ON public.competition_participations;
DROP POLICY IF EXISTS "users_own_participations_insert" ON public.competition_participations;
DROP POLICY IF EXISTS "admins_all_participations" ON public.competition_participations;
DROP POLICY IF EXISTS "Users can view own participations" ON public.competition_participations;
DROP POLICY IF EXISTS "Users can create own participations" ON public.competition_participations;
DROP POLICY IF EXISTS "Admins can manage all participations" ON public.competition_participations;

CREATE POLICY "users_manage_own_participations" ON public.competition_participations
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- 6. USER_WORD_HISTORY: Usuários só veem seu histórico, admins veem tudo
DROP POLICY IF EXISTS "Users can view own word history" ON public.user_word_history;
DROP POLICY IF EXISTS "Users can insert own word history" ON public.user_word_history;
DROP POLICY IF EXISTS "Admins can view all word history" ON public.user_word_history;

CREATE POLICY "users_manage_own_word_history" ON public.user_word_history
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- 7. COMPETITION_HISTORY: Usuários só veem seu histórico, admins veem tudo
DROP POLICY IF EXISTS "Users can view own competition history" ON public.competition_history;
DROP POLICY IF EXISTS "System can insert competition history" ON public.competition_history;
DROP POLICY IF EXISTS "Admins can view all competition history" ON public.competition_history;

CREATE POLICY "users_view_own_competition_history" ON public.competition_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- Sistema pode inserir histórico
CREATE POLICY "system_insert_competition_history" ON public.competition_history
  FOR INSERT
  WITH CHECK (true);

-- 8. TABELAS ADMINISTRATIVAS: Apenas admins têm acesso
-- ADMIN_ACTIONS: Apenas admins
CREATE POLICY "admins_only_admin_actions" ON public.admin_actions
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 9. GAME_SETTINGS: Leitura para todos, escrita apenas para admins
DROP POLICY IF EXISTS "read_game_settings" ON public.game_settings;

CREATE POLICY "all_read_game_settings" ON public.game_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admins_insert_game_settings" ON public.game_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "admins_update_game_settings" ON public.game_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admins_delete_game_settings" ON public.game_settings
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 10. CUSTOM_COMPETITIONS: Leitura para todos, gestão apenas para admins
DROP POLICY IF EXISTS "authenticated_users_can_view_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "admins_can_manage_competitions" ON public.custom_competitions;

CREATE POLICY "all_view_competitions" ON public.custom_competitions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admins_insert_competitions" ON public.custom_competitions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "admins_update_competitions" ON public.custom_competitions
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admins_delete_competitions" ON public.custom_competitions
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 11. PAYMENT_HISTORY: Usuários veem apenas seus pagamentos, admins veem tudo
CREATE POLICY "users_view_own_payments" ON public.payment_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "admins_insert_payments" ON public.payment_history
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "admins_update_payments" ON public.payment_history
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admins_delete_payments" ON public.payment_history
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 12. PRIZE_DISTRIBUTIONS: Usuários veem apenas seus prêmios, admins veem tudo
CREATE POLICY "users_view_own_prizes" ON public.prize_distributions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "admins_insert_prizes" ON public.prize_distributions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "admins_update_prizes" ON public.prize_distributions
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admins_delete_prizes" ON public.prize_distributions
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- LIMPEZA E CORREÇÃO COMPLETA DAS POLÍTICAS RLS
-- Baseado no relatório de impacto detalhado

-- =======================
-- FASE 1: CORREÇÕES CRÍTICAS
-- =======================

-- 1. CORRIGIR competition_participations.user_id para NOT NULL
ALTER TABLE public.competition_participations 
ALTER COLUMN user_id SET NOT NULL;

-- 2. LIMPAR POLÍTICAS DUPLICADAS E CONFLITANTES

-- USER_ROLES: Remover todas as políticas antigas e criar novas consistentes
DROP POLICY IF EXISTS "view_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "manage_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "users_view_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins_manage_all_roles" ON public.user_roles;

-- Políticas simplificadas para user_roles
CREATE POLICY "users_can_view_own_roles" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "admins_can_manage_all_roles" ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- PROFILES: Limpar políticas conflitantes
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admins_manage_all_profiles" ON public.profiles;

-- Políticas consolidadas para profiles
CREATE POLICY "users_can_manage_own_profile" ON public.profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "admins_can_view_all_profiles" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "admins_can_update_all_profiles" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- GAME_SESSIONS: Consolidar políticas
DROP POLICY IF EXISTS "users_manage_own_sessions" ON public.game_sessions;

CREATE POLICY "users_can_manage_own_sessions" ON public.game_sessions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- COMPETITION_PARTICIPATIONS: Consolidar políticas
DROP POLICY IF EXISTS "users_manage_own_participations" ON public.competition_participations;

CREATE POLICY "users_can_view_own_participations" ON public.competition_participations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "users_can_create_participations" ON public.competition_participations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "admins_can_update_participations" ON public.competition_participations
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- USER_WORD_HISTORY: Consolidar políticas
DROP POLICY IF EXISTS "users_manage_own_word_history" ON public.user_word_history;

CREATE POLICY "users_can_manage_own_word_history" ON public.user_word_history
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- COMPETITION_HISTORY: Consolidar políticas
DROP POLICY IF EXISTS "users_view_own_competition_history" ON public.competition_history;
DROP POLICY IF EXISTS "system_insert_competition_history" ON public.competition_history;

CREATE POLICY "users_can_view_own_competition_history" ON public.competition_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "system_can_insert_competition_history" ON public.competition_history
  FOR INSERT
  WITH CHECK (true);

-- GAME_SETTINGS: Consolidar políticas
DROP POLICY IF EXISTS "all_read_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "admins_insert_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "admins_update_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "admins_delete_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "read_game_settings" ON public.game_settings;

CREATE POLICY "authenticated_users_can_read_game_settings" ON public.game_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admins_can_manage_game_settings" ON public.game_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- CUSTOM_COMPETITIONS: Consolidar políticas
DROP POLICY IF EXISTS "all_view_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "admins_insert_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "admins_update_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "admins_delete_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "authenticated_users_can_view_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "admins_can_manage_competitions" ON public.custom_competitions;

CREATE POLICY "authenticated_users_can_view_competitions" ON public.custom_competitions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admins_can_manage_competitions" ON public.custom_competitions
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =======================
-- FASE 2: TABELAS ADMINISTRATIVAS
-- =======================

-- ADMIN_ACTIONS: Apenas admins
DROP POLICY IF EXISTS "admins_only_admin_actions" ON public.admin_actions;

CREATE POLICY "admins_can_manage_admin_actions" ON public.admin_actions
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- PAYMENT_HISTORY: Usuários veem próprios, admins veem tudo
DROP POLICY IF EXISTS "users_view_own_payments" ON public.payment_history;
DROP POLICY IF EXISTS "admins_insert_payments" ON public.payment_history;
DROP POLICY IF EXISTS "admins_update_payments" ON public.payment_history;
DROP POLICY IF EXISTS "admins_delete_payments" ON public.payment_history;

CREATE POLICY "users_can_view_own_payments" ON public.payment_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "admins_can_manage_payments" ON public.payment_history
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- PRIZE_DISTRIBUTIONS: Usuários veem próprios, admins veem tudo
DROP POLICY IF EXISTS "users_view_own_prizes" ON public.prize_distributions;
DROP POLICY IF EXISTS "admins_insert_prizes" ON public.prize_distributions;
DROP POLICY IF EXISTS "admins_update_prizes" ON public.prize_distributions;
DROP POLICY IF EXISTS "admins_delete_prizes" ON public.prize_distributions;

CREATE POLICY "users_can_view_own_prizes" ON public.prize_distributions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "admins_can_manage_prizes" ON public.prize_distributions
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =======================
-- FASE 3: TABELAS SEM POLÍTICAS (CRIAR BÁSICAS)
-- =======================

-- CHALLENGES: Leitura para todos, gestão para admins
CREATE POLICY "authenticated_users_can_view_challenges" ON public.challenges
  FOR SELECT
  TO authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "admins_can_manage_challenges" ON public.challenges
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- CHALLENGE_PROGRESS: Usuários veem próprio progresso
CREATE POLICY "users_can_view_own_challenge_progress" ON public.challenge_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "users_can_manage_own_challenge_progress" ON public.challenge_progress
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- COMPETITIONS: Leitura para todos, gestão para admins
CREATE POLICY "authenticated_users_can_view_competitions_table" ON public.competitions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admins_can_manage_competitions_table" ON public.competitions
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- INVITE_REWARDS: Usuários veem próprias recompensas
CREATE POLICY "users_can_view_own_invite_rewards" ON public.invite_rewards
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR invited_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "system_can_manage_invite_rewards" ON public.invite_rewards
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- INVITES: Usuários veem próprios convites
CREATE POLICY "users_can_view_related_invites" ON public.invites
  FOR SELECT
  TO authenticated
  USING (invited_by = auth.uid() OR used_by = auth.uid() OR public.is_admin());

CREATE POLICY "users_can_create_invites" ON public.invites
  FOR INSERT
  TO authenticated
  WITH CHECK (invited_by = auth.uid() OR public.is_admin());

CREATE POLICY "users_can_update_own_invites" ON public.invites
  FOR UPDATE
  TO authenticated
  USING (invited_by = auth.uid() OR used_by = auth.uid() OR public.is_admin())
  WITH CHECK (invited_by = auth.uid() OR used_by = auth.uid() OR public.is_admin());

-- LEVEL_WORDS: Leitura para todos, gestão para admins
CREATE POLICY "authenticated_users_can_view_level_words" ON public.level_words
  FOR SELECT
  TO authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "admins_can_manage_level_words" ON public.level_words
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- PRIZE_CONFIGURATIONS: Leitura para todos, gestão para admins
CREATE POLICY "authenticated_users_can_view_prize_configs" ON public.prize_configurations
  FOR SELECT
  TO authenticated
  USING (active = true OR public.is_admin());

CREATE POLICY "admins_can_manage_prize_configs" ON public.prize_configurations
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- USER_REPORTS: Usuários veem próprios reports, admins veem tudo
CREATE POLICY "users_can_view_own_reports" ON public.user_reports
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "users_can_create_reports" ON public.user_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "admins_can_manage_reports" ON public.user_reports
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- WEEKLY_RANKINGS: Leitura para todos, gestão para admins/sistema
DROP POLICY IF EXISTS "view_weekly_rankings" ON public.weekly_rankings;
DROP POLICY IF EXISTS "insert_weekly_rankings" ON public.weekly_rankings;

CREATE POLICY "authenticated_users_can_view_weekly_rankings" ON public.weekly_rankings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "system_can_manage_weekly_rankings" ON public.weekly_rankings
  FOR ALL
  WITH CHECK (true);

-- WORD_CATEGORIES: Leitura para todos, gestão para admins
CREATE POLICY "authenticated_users_can_view_word_categories" ON public.word_categories
  FOR SELECT
  TO authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "admins_can_manage_word_categories" ON public.word_categories
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- WORDS_FOUND: Usuários veem próprias palavras encontradas
CREATE POLICY "users_can_view_session_words_found" ON public.words_found
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.game_sessions gs 
      WHERE gs.id = session_id AND gs.user_id = auth.uid()
    ) OR public.is_admin()
  );

CREATE POLICY "users_can_insert_words_found" ON public.words_found
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.game_sessions gs 
      WHERE gs.id = session_id AND gs.user_id = auth.uid()
    ) OR public.is_admin()
  );

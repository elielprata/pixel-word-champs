
-- ===================================
-- LIMPEZA COMPLETA DAS POLÍTICAS RLS
-- ===================================

-- FASE 1: REMOÇÃO TOTAL DE TODAS AS POLÍTICAS ANTIGAS

-- ADMIN_ACTIONS
DROP POLICY IF EXISTS "admins_only_admin_actions" ON public.admin_actions;
DROP POLICY IF EXISTS "admins_can_manage_admin_actions" ON public.admin_actions;

-- CHALLENGE_PROGRESS  
DROP POLICY IF EXISTS "users_can_view_own_challenge_progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "users_can_manage_own_challenge_progress" ON public.challenge_progress;

-- CHALLENGES
DROP POLICY IF EXISTS "authenticated_users_can_view_challenges" ON public.challenges;
DROP POLICY IF EXISTS "admins_can_manage_challenges" ON public.challenges;

-- COMPETITION_HISTORY
DROP POLICY IF EXISTS "users_view_own_competition_history" ON public.competition_history;
DROP POLICY IF EXISTS "system_insert_competition_history" ON public.competition_history;
DROP POLICY IF EXISTS "users_can_view_own_competition_history" ON public.competition_history;
DROP POLICY IF EXISTS "system_can_insert_competition_history" ON public.competition_history;

-- COMPETITION_PARTICIPATIONS
DROP POLICY IF EXISTS "users_own_participations_select" ON public.competition_participations;
DROP POLICY IF EXISTS "users_own_participations_insert" ON public.competition_participations;
DROP POLICY IF EXISTS "admins_all_participations" ON public.competition_participations;
DROP POLICY IF EXISTS "Users can view own participations" ON public.competition_participations;
DROP POLICY IF EXISTS "Users can create own participations" ON public.competition_participations;
DROP POLICY IF EXISTS "Admins can manage all participations" ON public.competition_participations;
DROP POLICY IF EXISTS "users_manage_own_participations" ON public.competition_participations;
DROP POLICY IF EXISTS "users_can_view_own_participations" ON public.competition_participations;
DROP POLICY IF EXISTS "users_can_create_participations" ON public.competition_participations;
DROP POLICY IF EXISTS "admins_can_update_participations" ON public.competition_participations;

-- COMPETITIONS
DROP POLICY IF EXISTS "authenticated_users_can_view_competitions_table" ON public.competitions;
DROP POLICY IF EXISTS "admins_can_manage_competitions_table" ON public.competitions;

-- CUSTOM_COMPETITIONS
DROP POLICY IF EXISTS "all_view_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "admins_insert_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "admins_update_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "admins_delete_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "authenticated_users_can_view_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "admins_can_manage_competitions" ON public.custom_competitions;

-- GAME_SESSIONS
DROP POLICY IF EXISTS "users_own_sessions_select" ON public.game_sessions;
DROP POLICY IF EXISTS "users_own_sessions_insert" ON public.game_sessions;
DROP POLICY IF EXISTS "users_own_sessions_update" ON public.game_sessions;
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "users_manage_own_sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "users_can_manage_own_sessions" ON public.game_sessions;

-- GAME_SETTINGS
DROP POLICY IF EXISTS "read_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "all_read_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "admins_insert_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "admins_update_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "admins_delete_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "authenticated_users_can_read_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "admins_can_manage_game_settings" ON public.game_settings;

-- INVITE_REWARDS
DROP POLICY IF EXISTS "users_can_view_own_invite_rewards" ON public.invite_rewards;
DROP POLICY IF EXISTS "system_can_manage_invite_rewards" ON public.invite_rewards;

-- INVITES
DROP POLICY IF EXISTS "users_can_view_related_invites" ON public.invites;
DROP POLICY IF EXISTS "users_can_create_invites" ON public.invites;
DROP POLICY IF EXISTS "users_can_update_own_invites" ON public.invites;

-- LEVEL_WORDS
DROP POLICY IF EXISTS "authenticated_users_can_view_level_words" ON public.level_words;
DROP POLICY IF EXISTS "admins_can_manage_level_words" ON public.level_words;

-- PAYMENT_HISTORY
DROP POLICY IF EXISTS "users_view_own_payments" ON public.payment_history;
DROP POLICY IF EXISTS "admins_insert_payments" ON public.payment_history;
DROP POLICY IF EXISTS "admins_update_payments" ON public.payment_history;
DROP POLICY IF EXISTS "admins_delete_payments" ON public.payment_history;
DROP POLICY IF EXISTS "users_can_view_own_payments" ON public.payment_history;
DROP POLICY IF EXISTS "admins_can_manage_payments" ON public.payment_history;

-- PRIZE_CONFIGURATIONS
DROP POLICY IF EXISTS "authenticated_users_can_view_prize_configs" ON public.prize_configurations;
DROP POLICY IF EXISTS "admins_can_manage_prize_configs" ON public.prize_configurations;

-- PRIZE_DISTRIBUTIONS
DROP POLICY IF EXISTS "users_view_own_prizes" ON public.prize_distributions;
DROP POLICY IF EXISTS "admins_insert_prizes" ON public.prize_distributions;
DROP POLICY IF EXISTS "admins_update_prizes" ON public.prize_distributions;
DROP POLICY IF EXISTS "admins_delete_prizes" ON public.prize_distributions;
DROP POLICY IF EXISTS "users_can_view_own_prizes" ON public.prize_distributions;
DROP POLICY IF EXISTS "admins_can_manage_prizes" ON public.prize_distributions;

-- PROFILES
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admins_manage_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_can_manage_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admins_can_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_can_update_all_profiles" ON public.profiles;

-- USER_REPORTS
DROP POLICY IF EXISTS "users_can_view_own_reports" ON public.user_reports;
DROP POLICY IF EXISTS "users_can_create_reports" ON public.user_reports;
DROP POLICY IF EXISTS "admins_can_manage_reports" ON public.user_reports;

-- USER_ROLES
DROP POLICY IF EXISTS "view_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "manage_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "users_view_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins_manage_all_roles" ON public.user_roles;
DROP POLICY IF EXISTS "users_can_view_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins_can_manage_all_roles" ON public.user_roles;

-- USER_WORD_HISTORY
DROP POLICY IF EXISTS "Users can view own word history" ON public.user_word_history;
DROP POLICY IF EXISTS "Users can insert own word history" ON public.user_word_history;
DROP POLICY IF EXISTS "Admins can view all word history" ON public.user_word_history;
DROP POLICY IF EXISTS "users_manage_own_word_history" ON public.user_word_history;
DROP POLICY IF EXISTS "users_can_manage_own_word_history" ON public.user_word_history;

-- WEEKLY_RANKINGS
DROP POLICY IF EXISTS "view_weekly_rankings" ON public.weekly_rankings;
DROP POLICY IF EXISTS "insert_weekly_rankings" ON public.weekly_rankings;
DROP POLICY IF EXISTS "authenticated_users_can_view_weekly_rankings" ON public.weekly_rankings;
DROP POLICY IF EXISTS "system_can_manage_weekly_rankings" ON public.weekly_rankings;

-- WORD_CATEGORIES
DROP POLICY IF EXISTS "authenticated_users_can_view_word_categories" ON public.word_categories;
DROP POLICY IF EXISTS "admins_can_manage_word_categories" ON public.word_categories;

-- WORDS_FOUND
DROP POLICY IF EXISTS "users_can_view_session_words_found" ON public.words_found;
DROP POLICY IF EXISTS "users_can_insert_words_found" ON public.words_found;

-- ===================================
-- FASE 2: CRIAR POLÍTICAS PADRONIZADAS
-- ===================================

-- 1. PROFILES (Base para autenticação)
CREATE POLICY "users_select_own_profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "users_update_own_profile" ON public.profiles
  FOR UPDATE TO authenticated  
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "admins_select_all_profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "admins_update_all_profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2. USER_ROLES (Sistema de permissões)
CREATE POLICY "users_select_own_roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "admins_manage_all_roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. GAME_SESSIONS (Sessões de jogo)
CREATE POLICY "users_manage_own_sessions" ON public.game_sessions
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- 4. COMPETITION_PARTICIPATIONS (Participações em competições)
CREATE POLICY "users_select_own_participations" ON public.competition_participations
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "users_insert_own_participations" ON public.competition_participations
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "admins_update_participations" ON public.competition_participations
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. USER_WORD_HISTORY (Histórico de palavras)
CREATE POLICY "users_manage_own_word_history" ON public.user_word_history
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- 6. COMPETITION_HISTORY (Histórico de competições)
CREATE POLICY "users_select_own_competition_history" ON public.competition_history
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "system_insert_competition_history" ON public.competition_history
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 7. GAME_SETTINGS (Configurações do jogo)
CREATE POLICY "authenticated_select_game_settings" ON public.game_settings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "admins_manage_game_settings" ON public.game_settings
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 8. CUSTOM_COMPETITIONS (Competições customizadas)
CREATE POLICY "authenticated_select_competitions" ON public.custom_competitions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "admins_manage_competitions" ON public.custom_competitions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 9. ADMIN_ACTIONS (Ações administrativas)
CREATE POLICY "admins_manage_admin_actions" ON public.admin_actions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 10. PAYMENT_HISTORY (Histórico de pagamentos)
CREATE POLICY "users_select_own_payments" ON public.payment_history
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "admins_manage_payments" ON public.payment_history
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 11. PRIZE_DISTRIBUTIONS (Distribuição de prêmios)
CREATE POLICY "users_select_own_prizes" ON public.prize_distributions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "admins_manage_prizes" ON public.prize_distributions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 12. CHALLENGES (Desafios)
CREATE POLICY "authenticated_select_challenges" ON public.challenges
  FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "admins_manage_challenges" ON public.challenges
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 13. CHALLENGE_PROGRESS (Progresso em desafios)
CREATE POLICY "users_manage_own_challenge_progress" ON public.challenge_progress
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- 14. COMPETITIONS (Competições)
CREATE POLICY "authenticated_select_competitions_table" ON public.competitions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "admins_manage_competitions_table" ON public.competitions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 15. INVITE_REWARDS (Recompensas de convite)
CREATE POLICY "users_select_own_invite_rewards" ON public.invite_rewards
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR invited_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "system_manage_invite_rewards" ON public.invite_rewards
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 16. INVITES (Convites)
CREATE POLICY "users_select_related_invites" ON public.invites
  FOR SELECT TO authenticated
  USING (invited_by = auth.uid() OR used_by = auth.uid() OR public.is_admin());

CREATE POLICY "users_insert_invites" ON public.invites
  FOR INSERT TO authenticated
  WITH CHECK (invited_by = auth.uid() OR public.is_admin());

CREATE POLICY "users_update_own_invites" ON public.invites
  FOR UPDATE TO authenticated
  USING (invited_by = auth.uid() OR used_by = auth.uid() OR public.is_admin())
  WITH CHECK (invited_by = auth.uid() OR used_by = auth.uid() OR public.is_admin());

-- 17. LEVEL_WORDS (Palavras por nível)
CREATE POLICY "authenticated_select_level_words" ON public.level_words
  FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "admins_manage_level_words" ON public.level_words
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 18. PRIZE_CONFIGURATIONS (Configurações de prêmios)
CREATE POLICY "authenticated_select_prize_configs" ON public.prize_configurations
  FOR SELECT TO authenticated
  USING (active = true OR public.is_admin());

CREATE POLICY "admins_manage_prize_configs" ON public.prize_configurations
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 19. USER_REPORTS (Relatórios de usuários)
CREATE POLICY "users_select_own_reports" ON public.user_reports
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "users_insert_reports" ON public.user_reports
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "admins_manage_reports" ON public.user_reports
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 20. WEEKLY_RANKINGS (Rankings semanais)
CREATE POLICY "authenticated_select_weekly_rankings" ON public.weekly_rankings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "system_manage_weekly_rankings" ON public.weekly_rankings
  FOR ALL TO authenticated
  WITH CHECK (true);

-- 21. WORD_CATEGORIES (Categorias de palavras)
CREATE POLICY "authenticated_select_word_categories" ON public.word_categories
  FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "admins_manage_word_categories" ON public.word_categories
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 22. WORDS_FOUND (Palavras encontradas)
CREATE POLICY "users_select_session_words_found" ON public.words_found
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.game_sessions gs 
      WHERE gs.id = session_id AND gs.user_id = auth.uid()
    ) OR public.is_admin()
  );

CREATE POLICY "users_insert_words_found" ON public.words_found
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.game_sessions gs 
      WHERE gs.id = session_id AND gs.user_id = auth.uid()
    ) OR public.is_admin()
  );

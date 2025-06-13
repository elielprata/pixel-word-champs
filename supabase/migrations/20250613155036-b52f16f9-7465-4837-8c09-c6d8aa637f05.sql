
-- ===================================
-- FASE 3: IMPLEMENTAÇÃO DE POLÍTICAS PADRONIZADAS
-- ===================================

-- PADRÃO APLICADO:
-- 1. Máximo 3 políticas por tabela
-- 2. Nomenclatura consistente: {ação}_{escopo}_{tabela}
-- 3. Usar função is_admin() para verificações de admin
-- 4. auth.uid() para verificações de usuário próprio

-- ===================================
-- 1. PROFILES (Base para autenticação)
-- ===================================
CREATE POLICY "select_own_profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "update_own_profiles" ON public.profiles
  FOR UPDATE TO authenticated  
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "admin_all_profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ===================================
-- 2. USER_ROLES (Sistema de permissões)
-- ===================================
CREATE POLICY "select_own_user_roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "admin_all_user_roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ===================================
-- 3. GAME_SESSIONS (Sessões de jogo)
-- ===================================
CREATE POLICY "manage_own_game_sessions" ON public.game_sessions
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ===================================
-- 4. COMPETITION_PARTICIPATIONS (Participações)
-- ===================================
CREATE POLICY "select_own_participations" ON public.competition_participations
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "insert_own_participations" ON public.competition_participations
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "admin_all_participations" ON public.competition_participations
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ===================================
-- 5. USER_WORD_HISTORY (Histórico de palavras)
-- ===================================
CREATE POLICY "manage_own_word_history" ON public.user_word_history
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ===================================
-- 6. COMPETITION_HISTORY (Histórico de competições)
-- ===================================
CREATE POLICY "select_own_competition_history" ON public.competition_history
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "insert_competition_history" ON public.competition_history
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ===================================
-- 7. DADOS PÚBLICOS (Leitura livre)
-- ===================================

-- GAME_SETTINGS
CREATE POLICY "select_game_settings" ON public.game_settings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "admin_all_game_settings" ON public.game_settings
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- CUSTOM_COMPETITIONS
CREATE POLICY "select_custom_competitions" ON public.custom_competitions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "admin_all_custom_competitions" ON public.custom_competitions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- COMPETITIONS
CREATE POLICY "select_competitions" ON public.competitions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "admin_all_competitions" ON public.competitions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- CHALLENGES
CREATE POLICY "select_active_challenges" ON public.challenges
  FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "admin_all_challenges" ON public.challenges
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- LEVEL_WORDS
CREATE POLICY "select_active_level_words" ON public.level_words
  FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "admin_all_level_words" ON public.level_words
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- WORD_CATEGORIES
CREATE POLICY "select_active_word_categories" ON public.word_categories
  FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "admin_all_word_categories" ON public.word_categories
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- PRIZE_CONFIGURATIONS
CREATE POLICY "select_active_prize_configs" ON public.prize_configurations
  FOR SELECT TO authenticated
  USING (active = true OR public.is_admin());

CREATE POLICY "admin_all_prize_configs" ON public.prize_configurations
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- WEEKLY_RANKINGS
CREATE POLICY "select_weekly_rankings" ON public.weekly_rankings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "system_all_weekly_rankings" ON public.weekly_rankings
  FOR ALL TO authenticated
  WITH CHECK (true);

-- ===================================
-- 8. DADOS ADMINISTRATIVOS
-- ===================================

-- ADMIN_ACTIONS
CREATE POLICY "admin_all_admin_actions" ON public.admin_actions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- PAYMENT_HISTORY
CREATE POLICY "select_own_payment_history" ON public.payment_history
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "admin_all_payment_history" ON public.payment_history
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- PRIZE_DISTRIBUTIONS
CREATE POLICY "select_own_prize_distributions" ON public.prize_distributions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "admin_all_prize_distributions" ON public.prize_distributions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ===================================
-- 9. SISTEMA DE CONVITES
-- ===================================

-- INVITES
CREATE POLICY "select_related_invites" ON public.invites
  FOR SELECT TO authenticated
  USING (invited_by = auth.uid() OR used_by = auth.uid() OR public.is_admin());

CREATE POLICY "insert_own_invites" ON public.invites
  FOR INSERT TO authenticated
  WITH CHECK (invited_by = auth.uid() OR public.is_admin());

CREATE POLICY "update_related_invites" ON public.invites
  FOR UPDATE TO authenticated
  USING (invited_by = auth.uid() OR used_by = auth.uid() OR public.is_admin())
  WITH CHECK (invited_by = auth.uid() OR used_by = auth.uid() OR public.is_admin());

-- INVITE_REWARDS
CREATE POLICY "select_own_invite_rewards" ON public.invite_rewards
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR invited_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "admin_all_invite_rewards" ON public.invite_rewards
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ===================================
-- 10. SISTEMA DE RELATÓRIOS
-- ===================================

-- USER_REPORTS
CREATE POLICY "select_own_user_reports" ON public.user_reports
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "insert_user_reports" ON public.user_reports
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "admin_all_user_reports" ON public.user_reports
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ===================================
-- 11. SISTEMA DE JOGOS
-- ===================================

-- CHALLENGE_PROGRESS
CREATE POLICY "manage_own_challenge_progress" ON public.challenge_progress
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- WORDS_FOUND
CREATE POLICY "select_session_words_found" ON public.words_found
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.game_sessions gs 
      WHERE gs.id = session_id AND gs.user_id = auth.uid()
    ) OR public.is_admin()
  );

CREATE POLICY "insert_session_words_found" ON public.words_found
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.game_sessions gs 
      WHERE gs.id = session_id AND gs.user_id = auth.uid()
    ) OR public.is_admin()
  );

-- ===================================
-- VERIFICAÇÃO FINAL
-- ===================================
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    RAISE NOTICE 'FASE 3 CONCLUÍDA: % políticas RLS criadas com padrão simplificado', policy_count;
    RAISE NOTICE 'Sistema de segurança padronizado e otimizado implementado com sucesso!';
END $$;

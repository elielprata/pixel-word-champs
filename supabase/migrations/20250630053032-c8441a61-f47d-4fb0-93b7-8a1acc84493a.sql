
-- Otimização de Performance: Corrigir políticas RLS em múltiplas tabelas
-- Substituir auth.uid() direto por (SELECT auth.uid()) para evitar re-avaliação por linha

-- 1. COMPETITIONS - Otimizar políticas existentes
DROP POLICY IF EXISTS "Everyone can view active competitions" ON public.competitions;
DROP POLICY IF EXISTS "Admins can manage competitions" ON public.competitions;
DROP POLICY IF EXISTS "select_competitions" ON public.competitions;
DROP POLICY IF EXISTS "admin_all_competitions" ON public.competitions;

-- Recriar políticas otimizadas para competitions
CREATE POLICY "select_competitions_optimized" ON public.competitions
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "admin_all_competitions_optimized" ON public.competitions
  FOR ALL 
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2. GAME_SESSIONS - Otimizar políticas existentes
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "Users can create their own sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "users_own_sessions_select" ON public.game_sessions;
DROP POLICY IF EXISTS "users_own_sessions_insert" ON public.game_sessions;
DROP POLICY IF EXISTS "users_own_sessions_update" ON public.game_sessions;
DROP POLICY IF EXISTS "users_manage_own_sessions" ON public.game_sessions;

-- Recriar políticas otimizadas para game_sessions
CREATE POLICY "game_sessions_user_access_optimized" ON public.game_sessions
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (SELECT auth.uid()) OR public.is_admin());

-- 3. WORDS_FOUND - Otimizar políticas existentes
DROP POLICY IF EXISTS "Users can view own words" ON public.words_found;
DROP POLICY IF EXISTS "Users can insert own words" ON public.words_found;
DROP POLICY IF EXISTS "select_session_words_found" ON public.words_found;
DROP POLICY IF EXISTS "insert_session_words_found" ON public.words_found;

-- Recriar políticas otimizadas para words_found
CREATE POLICY "words_found_select_optimized" ON public.words_found
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.game_sessions gs 
      WHERE gs.id = session_id AND gs.user_id = (SELECT auth.uid())
    ) OR public.is_admin()
  );

CREATE POLICY "words_found_insert_optimized" ON public.words_found
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.game_sessions gs 
      WHERE gs.id = session_id AND gs.user_id = (SELECT auth.uid())
    ) OR public.is_admin()
  );

-- 4. COMPETITION_PARTICIPATIONS - Otimizar políticas existentes
DROP POLICY IF EXISTS "Users can create own participation" ON public.competition_participations;
DROP POLICY IF EXISTS "Admins can manage participations" ON public.competition_participations;
DROP POLICY IF EXISTS "users_own_participations_select" ON public.competition_participations;
DROP POLICY IF EXISTS "users_own_participations_insert" ON public.competition_participations;
DROP POLICY IF EXISTS "admins_all_participations" ON public.competition_participations;
DROP POLICY IF EXISTS "select_own_participations" ON public.competition_participations;
DROP POLICY IF EXISTS "insert_own_participations" ON public.competition_participations;
DROP POLICY IF EXISTS "admin_all_participations" ON public.competition_participations;
DROP POLICY IF EXISTS "users_manage_own_participations" ON public.competition_participations;

-- Recriar políticas otimizadas para competition_participations
CREATE POLICY "competition_participations_user_optimized" ON public.competition_participations
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (SELECT auth.uid()) OR public.is_admin());

-- 5. MONTHLY_INVITE_POINTS - Otimizar políticas existentes
DROP POLICY IF EXISTS "Users can view their own monthly invite points" ON public.monthly_invite_points;

-- Recriar política otimizada para monthly_invite_points
CREATE POLICY "monthly_invite_points_user_optimized" ON public.monthly_invite_points
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "monthly_invite_points_insert_optimized" ON public.monthly_invite_points
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "monthly_invite_points_update_optimized" ON public.monthly_invite_points
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (SELECT auth.uid()) OR public.is_admin());

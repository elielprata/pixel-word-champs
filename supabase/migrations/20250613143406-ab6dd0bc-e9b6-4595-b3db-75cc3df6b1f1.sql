
-- ETAPA 1: CORREÇÃO DE POLÍTICAS RLS CRÍTICAS E CONFLITANTES (VERSÃO CORRIGIDA)

-- 1. CORRIGIR WEEKLY_RANKINGS - Problema crítico identificado nos logs
DROP POLICY IF EXISTS "Users can view their own weekly ranking" ON public.weekly_rankings;
DROP POLICY IF EXISTS "Admins can view all weekly rankings" ON public.weekly_rankings;
DROP POLICY IF EXISTS "System can manage weekly rankings" ON public.weekly_rankings;

-- Política corrigida para weekly_rankings - permitir inserção pelo sistema
CREATE POLICY "System can manage weekly rankings" ON public.weekly_rankings
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- 2. CORRIGIR COMPETITION_PARTICIPATIONS - Políticas conflitantes identificadas
DROP POLICY IF EXISTS "users_own_participations_select" ON public.competition_participations;
DROP POLICY IF EXISTS "users_own_participations_insert" ON public.competition_participations;
DROP POLICY IF EXISTS "admins_all_participations" ON public.competition_participations;
DROP POLICY IF EXISTS "Users can view own participations" ON public.competition_participations;
DROP POLICY IF EXISTS "Users can create own participations" ON public.competition_participations;
DROP POLICY IF EXISTS "Admins can manage all participations" ON public.competition_participations;

-- Políticas consolidadas para competition_participations
CREATE POLICY "Users can view own participations" ON public.competition_participations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own participations" ON public.competition_participations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all participations" ON public.competition_participations
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

-- 3. CORRIGIR CUSTOM_COMPETITIONS - Políticas muito permissivas
DROP POLICY IF EXISTS "authenticated_users_can_view_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "admins_can_manage_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "Users can view active competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "Admins can manage competitions" ON public.custom_competitions;

-- Políticas mais restritivas para custom_competitions
CREATE POLICY "Users can view active competitions" ON public.custom_competitions
  FOR SELECT
  TO authenticated
  USING (status IN ('active', 'scheduled'));

CREATE POLICY "Admins can manage competitions" ON public.custom_competitions
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

-- 4. CORRIGIR GAME_SESSIONS - Políticas inconsistentes
DROP POLICY IF EXISTS "users_own_sessions_select" ON public.game_sessions;
DROP POLICY IF EXISTS "users_own_sessions_insert" ON public.game_sessions;
DROP POLICY IF EXISTS "users_own_sessions_update" ON public.game_sessions;
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.game_sessions;

-- Políticas consolidadas para game_sessions
CREATE POLICY "Users can manage own sessions" ON public.game_sessions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 5. CORRIGIR USER_WORD_HISTORY - Remover políticas existentes primeiro
DROP POLICY IF EXISTS "Users can view their own word history" ON public.user_word_history;
DROP POLICY IF EXISTS "Users can insert their own word history" ON public.user_word_history;
DROP POLICY IF EXISTS "Admins can view all word history" ON public.user_word_history;
DROP POLICY IF EXISTS "Users can view own word history" ON public.user_word_history;
DROP POLICY IF EXISTS "Users can insert own word history" ON public.user_word_history;

-- Recriar políticas para user_word_history
CREATE POLICY "Users can view own word history" ON public.user_word_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own word history" ON public.user_word_history
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all word history" ON public.user_word_history
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

-- 6. CORRIGIR COMPETITION_HISTORY - Remover políticas existentes primeiro
DROP POLICY IF EXISTS "Users can view their own competition history" ON public.competition_history;
DROP POLICY IF EXISTS "System can insert competition history" ON public.competition_history;
DROP POLICY IF EXISTS "Admins can view all competition history" ON public.competition_history;
DROP POLICY IF EXISTS "Users can view own competition history" ON public.competition_history;

-- Recriar políticas para competition_history
CREATE POLICY "Users can view own competition history" ON public.competition_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert competition history" ON public.competition_history
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all competition history" ON public.competition_history
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

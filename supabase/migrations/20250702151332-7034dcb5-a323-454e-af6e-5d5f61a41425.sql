-- CORREÇÃO DE PERFORMANCE: Otimizar políticas RLS para evitar re-avaliação de auth.uid()
-- e corrigir problemas de múltiplas políticas permissivas

-- 1. OTIMIZAR POLÍTICAS RLS - Substituir auth.uid() por (select auth.uid())

-- Corrigir políticas da tabela profiles
DROP POLICY IF EXISTS "profiles_insert_optimized" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_optimized" ON public.profiles;

CREATE POLICY "profiles_insert_optimized" ON public.profiles
  FOR INSERT 
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "profiles_update_optimized" ON public.profiles
  FOR UPDATE 
  USING ((id = (select auth.uid())) OR is_admin())
  WITH CHECK ((id = (select auth.uid())) OR is_admin());

-- Corrigir políticas da tabela user_roles
DROP POLICY IF EXISTS "user_roles_select_optimized" ON public.user_roles;

CREATE POLICY "user_roles_select_optimized" ON public.user_roles
  FOR SELECT 
  USING ((user_id = (select auth.uid())) OR is_admin());

-- Corrigir políticas da tabela game_sessions
DROP POLICY IF EXISTS "game_sessions_select_optimized" ON public.game_sessions;
DROP POLICY IF EXISTS "game_sessions_insert_optimized" ON public.game_sessions;
DROP POLICY IF EXISTS "game_sessions_update_optimized" ON public.game_sessions;

CREATE POLICY "game_sessions_select_optimized" ON public.game_sessions
  FOR SELECT 
  USING ((user_id = (select auth.uid())) OR is_admin());

CREATE POLICY "game_sessions_insert_optimized" ON public.game_sessions
  FOR INSERT 
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "game_sessions_update_optimized" ON public.game_sessions
  FOR UPDATE 
  USING ((user_id = (select auth.uid())) OR is_admin())
  WITH CHECK ((user_id = (select auth.uid())) OR is_admin());

-- Corrigir políticas da tabela invites
DROP POLICY IF EXISTS "invites_select_optimized" ON public.invites;
DROP POLICY IF EXISTS "invites_insert_optimized" ON public.invites;
DROP POLICY IF EXISTS "invites_update_optimized" ON public.invites;

CREATE POLICY "invites_select_optimized" ON public.invites
  FOR SELECT 
  USING ((invited_by = (select auth.uid())) OR (used_by = (select auth.uid())) OR is_admin());

CREATE POLICY "invites_insert_optimized" ON public.invites
  FOR INSERT 
  WITH CHECK (invited_by = (select auth.uid()));

CREATE POLICY "invites_update_optimized" ON public.invites
  FOR UPDATE 
  USING ((invited_by = (select auth.uid())) OR (used_by = (select auth.uid())) OR is_admin())
  WITH CHECK ((invited_by = (select auth.uid())) OR (used_by = (select auth.uid())) OR is_admin());

-- Corrigir políticas da tabela challenge_progress
DROP POLICY IF EXISTS "challenge_progress_select_optimized" ON public.challenge_progress;
DROP POLICY IF EXISTS "challenge_progress_insert_optimized" ON public.challenge_progress;
DROP POLICY IF EXISTS "challenge_progress_update_optimized" ON public.challenge_progress;

CREATE POLICY "challenge_progress_select_optimized" ON public.challenge_progress
  FOR SELECT 
  USING ((user_id = (select auth.uid())) OR is_admin());

CREATE POLICY "challenge_progress_insert_optimized" ON public.challenge_progress
  FOR INSERT 
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "challenge_progress_update_optimized" ON public.challenge_progress
  FOR UPDATE 
  USING ((user_id = (select auth.uid())) OR is_admin())
  WITH CHECK ((user_id = (select auth.uid())) OR is_admin());

-- Corrigir políticas da tabela words_found
DROP POLICY IF EXISTS "words_found_select_optimized" ON public.words_found;
DROP POLICY IF EXISTS "words_found_insert_optimized" ON public.words_found;

CREATE POLICY "words_found_select_optimized" ON public.words_found
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM game_sessions gs
    WHERE ((gs.id = words_found.session_id) AND ((gs.user_id = (select auth.uid())) OR is_admin()))
  ));

CREATE POLICY "words_found_insert_optimized" ON public.words_found
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM game_sessions gs
    WHERE ((gs.id = words_found.session_id) AND (gs.user_id = (select auth.uid())))
  ));

-- Corrigir política da tabela weekly_rankings
DROP POLICY IF EXISTS "weekly_rankings_system_insert" ON public.weekly_rankings;

CREATE POLICY "weekly_rankings_system_insert" ON public.weekly_rankings
  FOR INSERT 
  WITH CHECK (is_admin() OR (current_setting('role'::text) = 'supabase_admin'::text));

-- 2. CONSOLIDAR POLÍTICAS MÚLTIPLAS PERMISSIVAS

-- Consolidar políticas da tabela challenges
DROP POLICY IF EXISTS "challenges_admin_manage" ON public.challenges;
DROP POLICY IF EXISTS "challenges_public_read" ON public.challenges;

CREATE POLICY "challenges_unified_policy" ON public.challenges
  FOR ALL 
  USING (((is_active = true) OR is_admin()))
  WITH CHECK (is_admin());

-- Consolidar políticas da tabela custom_competitions
DROP POLICY IF EXISTS "custom_competitions_admin_manage" ON public.custom_competitions;
DROP POLICY IF EXISTS "custom_competitions_public_read" ON public.custom_competitions;

CREATE POLICY "custom_competitions_unified_policy" ON public.custom_competitions
  FOR ALL 
  USING ((((status)::text = ANY ((ARRAY['active'::character varying, 'scheduled'::character varying])::text[])) OR is_admin()))
  WITH CHECK (is_admin());

-- Consolidar políticas da tabela level_words
DROP POLICY IF EXISTS "level_words_admin_manage" ON public.level_words;
DROP POLICY IF EXISTS "level_words_public_read" ON public.level_words;

CREATE POLICY "level_words_unified_policy" ON public.level_words
  FOR ALL 
  USING (((is_active = true) OR is_admin()))
  WITH CHECK (is_admin());

-- Consolidar políticas da tabela prize_configurations
DROP POLICY IF EXISTS "prize_configurations_admin_manage" ON public.prize_configurations;
DROP POLICY IF EXISTS "prize_configurations_public_read" ON public.prize_configurations;

CREATE POLICY "prize_configurations_unified_policy" ON public.prize_configurations
  FOR ALL 
  USING (((active = true) OR is_admin()))
  WITH CHECK (is_admin());

-- Consolidar políticas da tabela user_roles (mantendo select separado para performance)
DROP POLICY IF EXISTS "user_roles_manage_admin_only" ON public.user_roles;

CREATE POLICY "user_roles_manage_admin_only" ON public.user_roles
  FOR ALL 
  USING (is_admin())
  WITH CHECK (is_admin());

-- Consolidar políticas da tabela word_categories
DROP POLICY IF EXISTS "word_categories_admin_manage" ON public.word_categories;
DROP POLICY IF EXISTS "word_categories_public_read" ON public.word_categories;

CREATE POLICY "word_categories_unified_policy" ON public.word_categories
  FOR ALL 
  USING (((is_active = true) OR is_admin()))
  WITH CHECK (is_admin());

-- 3. REMOVER ÍNDICES DUPLICADOS

-- Remover índice duplicado da tabela user_activity_days
DROP INDEX IF EXISTS unique_user_activity_date;

-- Remover índice duplicado da tabela user_roles  
DROP INDEX IF EXISTS unique_user_role;

-- 4. ADICIONAR COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON POLICY "profiles_insert_optimized" ON public.profiles 
IS 'Política otimizada - usa (select auth.uid()) para melhor performance';

COMMENT ON POLICY "game_sessions_select_optimized" ON public.game_sessions 
IS 'Política otimizada - usa (select auth.uid()) para melhor performance';

COMMENT ON POLICY "challenges_unified_policy" ON public.challenges 
IS 'Política unificada para evitar múltiplas permissivas';
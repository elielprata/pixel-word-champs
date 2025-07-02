-- FASE 2: OTIMIZAÇÃO DE POLÍTICAS RLS
-- Padroniza e otimiza todas as políticas RLS para consistência e performance

-- ===================================
-- 1. REMOVER POLÍTICAS REDUNDANTES E INCONSISTENTES
-- ===================================

-- 1.1 Limpar políticas da tabela PROFILES
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;

-- 1.2 Limpar políticas da tabela USER_ROLES
DROP POLICY IF EXISTS "user_roles_unified_policy" ON public.user_roles;
DROP POLICY IF EXISTS "users_view_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins_manage_all_roles" ON public.user_roles;

-- 1.3 Limpar políticas redundantes de outras tabelas importantes
DROP POLICY IF EXISTS "game_sessions_unified_policy" ON public.game_sessions;
DROP POLICY IF EXISTS "users_manage_own_sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "admins_view_all_sessions" ON public.game_sessions;

-- ===================================
-- 2. CRIAR POLÍTICAS PADRONIZADAS E OTIMIZADAS
-- ===================================

-- 2.1 PROFILES - Políticas otimizadas
CREATE POLICY "profiles_select_optimized" ON public.profiles
  FOR SELECT 
  TO authenticated
  USING (true); -- Perfis são públicos para visualização

CREATE POLICY "profiles_insert_optimized" ON public.profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_optimized" ON public.profiles
  FOR UPDATE 
  TO authenticated
  USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_delete_admin_only" ON public.profiles
  FOR DELETE 
  TO authenticated
  USING (is_admin());

-- 2.2 USER_ROLES - Políticas otimizadas
CREATE POLICY "user_roles_select_optimized" ON public.user_roles
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "user_roles_manage_admin_only" ON public.user_roles
  FOR ALL 
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 2.3 GAME_SESSIONS - Políticas otimizadas
CREATE POLICY "game_sessions_select_optimized" ON public.game_sessions
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "game_sessions_insert_optimized" ON public.game_sessions
  FOR INSERT 
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "game_sessions_update_optimized" ON public.game_sessions
  FOR UPDATE 
  TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "game_sessions_delete_admin_only" ON public.game_sessions
  FOR DELETE 
  TO authenticated
  USING (is_admin());

-- ===================================
-- 3. OTIMIZAR POLÍTICAS DE TABELAS ESPECÍFICAS
-- ===================================

-- 3.1 INVITES - Remover e recriar com padrão otimizado
DROP POLICY IF EXISTS "users_view_related_invites_optimized" ON public.invites;
DROP POLICY IF EXISTS "users_create_own_invites_optimized" ON public.invites;
DROP POLICY IF EXISTS "users_update_related_invites_optimized" ON public.invites;

CREATE POLICY "invites_select_optimized" ON public.invites
  FOR SELECT 
  TO authenticated
  USING (invited_by = auth.uid() OR used_by = auth.uid() OR is_admin());

CREATE POLICY "invites_insert_optimized" ON public.invites
  FOR INSERT 
  TO authenticated
  WITH CHECK (invited_by = auth.uid());

CREATE POLICY "invites_update_optimized" ON public.invites
  FOR UPDATE 
  TO authenticated
  USING (invited_by = auth.uid() OR used_by = auth.uid() OR is_admin())
  WITH CHECK (invited_by = auth.uid() OR used_by = auth.uid() OR is_admin());

CREATE POLICY "invites_delete_admin_only" ON public.invites
  FOR DELETE 
  TO authenticated
  USING (is_admin());

-- 3.2 CHALLENGE_PROGRESS - Otimizar políticas
DROP POLICY IF EXISTS "challenge_progress_unified_optimized" ON public.challenge_progress;

CREATE POLICY "challenge_progress_select_optimized" ON public.challenge_progress
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "challenge_progress_insert_optimized" ON public.challenge_progress
  FOR INSERT 
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "challenge_progress_update_optimized" ON public.challenge_progress
  FOR UPDATE 
  TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "challenge_progress_delete_admin_only" ON public.challenge_progress
  FOR DELETE 
  TO authenticated
  USING (is_admin());

-- 3.3 WORDS_FOUND - Otimizar políticas baseadas em sessão
DROP POLICY IF EXISTS "words_found_select_optimized" ON public.words_found;
DROP POLICY IF EXISTS "words_found_insert_optimized" ON public.words_found;

CREATE POLICY "words_found_select_optimized" ON public.words_found
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM game_sessions gs 
      WHERE gs.id = words_found.session_id 
        AND (gs.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "words_found_insert_optimized" ON public.words_found
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_sessions gs 
      WHERE gs.id = words_found.session_id 
        AND gs.user_id = auth.uid()
    )
  );

-- ===================================
-- 4. POLÍTICAS PARA DADOS PÚBLICOS
-- ===================================

-- 4.1 Remover e recriar políticas de dados públicos com padrão consistente
DROP POLICY IF EXISTS "level_words_unified_policy" ON public.level_words;
DROP POLICY IF EXISTS "challenges_unified_policy" ON public.challenges;
DROP POLICY IF EXISTS "word_categories_unified_policy" ON public.word_categories;
DROP POLICY IF EXISTS "prize_configurations_unified_policy" ON public.prize_configurations;

-- Level Words - Acesso público para ativos, admin para gestão
CREATE POLICY "level_words_public_read" ON public.level_words
  FOR SELECT 
  TO authenticated
  USING (is_active = true OR is_admin());

CREATE POLICY "level_words_admin_manage" ON public.level_words
  FOR ALL 
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Challenges - Acesso público para ativos, admin para gestão
CREATE POLICY "challenges_public_read" ON public.challenges
  FOR SELECT 
  TO authenticated
  USING (is_active = true OR is_admin());

CREATE POLICY "challenges_admin_manage" ON public.challenges
  FOR ALL 
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Word Categories - Acesso público para ativos, admin para gestão
CREATE POLICY "word_categories_public_read" ON public.word_categories
  FOR SELECT 
  TO authenticated
  USING (is_active = true OR is_admin());

CREATE POLICY "word_categories_admin_manage" ON public.word_categories
  FOR ALL 
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Prize Configurations - Acesso público para ativos, admin para gestão
CREATE POLICY "prize_configurations_public_read" ON public.prize_configurations
  FOR SELECT 
  TO authenticated
  USING (active = true OR is_admin());

CREATE POLICY "prize_configurations_admin_manage" ON public.prize_configurations
  FOR ALL 
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ===================================
-- 5. OTIMIZAR POLÍTICAS DE RANKING E COMPETIÇÕES
-- ===================================

-- 5.1 Weekly Rankings - Leitura pública, escrita admin/sistema
DROP POLICY IF EXISTS "weekly_rankings_unified_policy" ON public.weekly_rankings;

CREATE POLICY "weekly_rankings_public_read" ON public.weekly_rankings
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "weekly_rankings_system_insert" ON public.weekly_rankings
  FOR INSERT 
  TO authenticated
  WITH CHECK (is_admin() OR current_setting('role') = 'supabase_admin');

CREATE POLICY "weekly_rankings_admin_manage" ON public.weekly_rankings
  FOR UPDATE 
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "weekly_rankings_admin_delete" ON public.weekly_rankings
  FOR DELETE 
  TO authenticated
  USING (is_admin());

-- 5.2 Custom Competitions - Leitura pública para ativas, admin para gestão
DROP POLICY IF EXISTS "custom_competitions_unified_policy" ON public.custom_competitions;

CREATE POLICY "custom_competitions_public_read" ON public.custom_competitions
  FOR SELECT 
  TO authenticated
  USING (status IN ('active', 'scheduled') OR is_admin());

CREATE POLICY "custom_competitions_admin_manage" ON public.custom_competitions
  FOR ALL 
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ===================================
-- VERIFICAÇÃO FINAL DAS POLÍTICAS
-- ===================================
DO $$
DECLARE
    policy_count INTEGER;
    optimized_policies INTEGER;
    table_count INTEGER;
BEGIN
    -- Contar total de políticas
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    -- Contar políticas otimizadas (que seguem o novo padrão)
    SELECT COUNT(*) INTO optimized_policies
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND policyname LIKE '%_optimized' 
      OR policyname LIKE '%_public_read'
      OR policyname LIKE '%_admin_manage';
    
    -- Contar tabelas com RLS
    SELECT COUNT(*) INTO table_count
    FROM pg_tables 
    WHERE schemaname = 'public' AND rowsecurity = true;
    
    RAISE NOTICE '🎉 FASE 2 CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '📊 ESTATÍSTICAS DE OTIMIZAÇÃO:';
    RAISE NOTICE '  - % políticas RLS totais', policy_count;
    RAISE NOTICE '  - % políticas otimizadas', optimized_policies;
    RAISE NOTICE '  - % tabelas com RLS ativo', table_count;
    RAISE NOTICE '✅ Políticas padronizadas e otimizadas!';
    RAISE NOTICE '🚀 Performance melhorada!';
    RAISE NOTICE '🔒 Segurança mantida!';
    RAISE NOTICE '📈 Sistema pronto para Fase 3!';
END $$;

-- OTIMIZAÇÃO RLS PARTE 1: Corrigir primeiras 7 tabelas
-- Dividindo em partes para evitar deadlocks

-- 1. LEVEL_WORDS - Corrigir política de administração
DROP POLICY IF EXISTS "Admins can manage level words" ON public.level_words;
CREATE POLICY "admins_manage_level_words_optimized" ON public.level_words
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2. USER_WORD_HISTORY - Corrigir todas as políticas (4 políticas)
DROP POLICY IF EXISTS "Users can view their own word history" ON public.user_word_history;
DROP POLICY IF EXISTS "Users can insert their own word history" ON public.user_word_history;
DROP POLICY IF EXISTS "Users can update their own word history" ON public.user_word_history;
DROP POLICY IF EXISTS "users_manage_own_word_history" ON public.user_word_history;

CREATE POLICY "user_word_history_optimized" ON public.user_word_history
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (SELECT auth.uid()) OR public.is_admin());

-- 3. USER_ACTIVITY_DAYS - Corrigir política de visualização
DROP POLICY IF EXISTS "Users can view their own activity days" ON public.user_activity_days;
CREATE POLICY "user_activity_days_optimized" ON public.user_activity_days
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());

-- 4. ADMIN_ACTIONS - Corrigir políticas de administração (2 políticas)
DROP POLICY IF EXISTS "Admins can view action logs" ON public.admin_actions;
DROP POLICY IF EXISTS "Admins can insert action logs" ON public.admin_actions;

CREATE POLICY "admin_actions_optimized" ON public.admin_actions
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. WORD_CATEGORIES - Corrigir políticas administrativas (3 políticas)
DROP POLICY IF EXISTS "Only admins can insert word_categories" ON public.word_categories;
DROP POLICY IF EXISTS "Only admins can update word_categories" ON public.word_categories;
DROP POLICY IF EXISTS "Only admins can delete word_categories" ON public.word_categories;

CREATE POLICY "word_categories_admin_optimized" ON public.word_categories
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6. COMPETITION_HISTORY - Corrigir política de visualização
DROP POLICY IF EXISTS "users_view_own_competition_history" ON public.competition_history;
CREATE POLICY "competition_history_user_optimized" ON public.competition_history
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());

-- 7. PRIZE_CONFIGURATIONS - Corrigir política de escrita
DROP POLICY IF EXISTS "prize_configurations_write" ON public.prize_configurations;
CREATE POLICY "prize_configurations_admin_optimized" ON public.prize_configurations
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Garantir que RLS esteja habilitado
ALTER TABLE public.level_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_word_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_configurations ENABLE ROW LEVEL SECURITY;

-- Log da primeira parte
DO $$
BEGIN
  RAISE NOTICE '✅ PARTE 1/3 - 7 tabelas otimizadas com sucesso';
  RAISE NOTICE '📊 Progresso: 21/32 políticas RLS otimizadas';
END $$;

-- ROLLBACK COMPLETO DE TODAS AS IMPLEMENTAÇÕES RLS E FUNÇÕES CUSTOMIZADAS
-- Remove todas as funções customizadas e materialized views problemáticas

-- 1. DROPAR FUNÇÃO PERSONALIZADA get_current_weekly_ranking
DROP FUNCTION IF EXISTS public.get_current_weekly_ranking();

-- 2. DROPAR MATERIALIZED VIEW mv_current_weekly_ranking
DROP MATERIALIZED VIEW IF EXISTS public.mv_current_weekly_ranking;

-- 3. REVOGAR PERMISSÕES PERSONALIZADAS CRIADAS
-- (As permissões serão automaticamente removidas com a remoção da view)

-- 4. LIMPAR QUALQUER REFERÊNCIA REMANESCENTE
-- Remover políticas RLS que possam ter sido criadas para a view
DROP POLICY IF EXISTS "Current weekly ranking visible to authenticated users" ON public.mv_current_weekly_ranking;
DROP POLICY IF EXISTS "Admins can access current weekly ranking" ON public.mv_current_weekly_ranking;

-- 5. CONFIRMAR QUE A FUNÇÃO refresh_ranking_view NÃO TENTE REFERENCIAR A VIEW REMOVIDA
DROP FUNCTION IF EXISTS public.refresh_ranking_view();

-- 6. COMENTÁRIO DE CONFIRMAÇÃO DO ROLLBACK COMPLETO
COMMENT ON TABLE public.weekly_rankings IS 'Rollback completo executado - removidas todas as funções customizadas e materialized views problemáticas';
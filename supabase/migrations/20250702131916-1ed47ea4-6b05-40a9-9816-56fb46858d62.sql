-- ROLLBACK COMPLETO DE FUNÇÕES CUSTOMIZADAS PROBLEMÁTICAS
-- Remove apenas as funções que realmente existem

-- 1. DROPAR FUNÇÃO PERSONALIZADA get_current_weekly_ranking SE EXISTIR
DROP FUNCTION IF EXISTS public.get_current_weekly_ranking();

-- 2. REMOVER FUNÇÃO refresh_ranking_view SE EXISTIR  
DROP FUNCTION IF EXISTS public.refresh_ranking_view();

-- 3. COMENTÁRIO DE CONFIRMAÇÃO DO ROLLBACK COMPLETO
COMMENT ON TABLE public.weekly_rankings IS 'Rollback completo executado - removidas funções customizadas problemáticas';
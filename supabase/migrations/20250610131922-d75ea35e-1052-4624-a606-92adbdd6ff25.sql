
-- Remover todas as tabelas relacionadas ao sistema de ranking complexo
DROP TABLE IF EXISTS public.weekly_rankings CASCADE;
DROP TABLE IF EXISTS public.prize_distributions CASCADE;
DROP TABLE IF EXISTS public.prize_configurations CASCADE;

-- Remover a função de atualização de ranking semanal que não é mais necessária
DROP FUNCTION IF EXISTS public.update_weekly_ranking();

-- Remover outras funções relacionadas se existirem
DROP FUNCTION IF EXISTS public.update_daily_ranking() CASCADE;

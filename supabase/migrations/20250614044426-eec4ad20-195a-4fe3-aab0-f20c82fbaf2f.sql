
-- ===================================
-- CORREÇÃO DE PROBLEMAS DE SEGURANÇA
-- ===================================

-- 1. Corrigir função ensure_daily_competition_end_time com search_path seguro
CREATE OR REPLACE FUNCTION public.ensure_daily_competition_end_time()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se for uma competição diária (challenge), forçar fim às 23:59:59
  IF NEW.competition_type = 'challenge' THEN
    NEW.end_date := DATE_TRUNC('day', NEW.start_date) + INTERVAL '23 hours 59 minutes 59 seconds';
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. Corrigir função ensure_competition_standard_times com search_path seguro
CREATE OR REPLACE FUNCTION public.ensure_competition_standard_times()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Só aplicar correções de tempo se as datas foram realmente modificadas
  -- ou se for uma inserção (NEW sem OLD)
  IF TG_OP = 'INSERT' OR 
     (TG_OP = 'UPDATE' AND (
       OLD.start_date IS DISTINCT FROM NEW.start_date OR 
       OLD.end_date IS DISTINCT FROM NEW.end_date
     )) THEN
    
    -- Para competições diárias (challenge): forçar início às 03:00:00 UTC (00:00 Brasília) 
    -- e fim às 02:59:59 UTC do dia seguinte (23:59:59 Brasília)
    IF NEW.competition_type = 'challenge' THEN
      NEW.start_date := DATE_TRUNC('day', NEW.start_date) + INTERVAL '3 hours';
      NEW.end_date := DATE_TRUNC('day', NEW.start_date) + INTERVAL '1 day' + INTERVAL '2 hours 59 minutes 59 seconds';
    END IF;
    
    -- Para competições semanais (tournament): forçar início às 03:00:00 UTC (00:00 Brasília) 
    -- e fim às 02:59:59 UTC (23:59:59 Brasília)
    IF NEW.competition_type = 'tournament' THEN
      NEW.start_date := DATE_TRUNC('day', NEW.start_date) + INTERVAL '3 hours';
      NEW.end_date := DATE_TRUNC('day', NEW.end_date) + INTERVAL '1 day' + INTERVAL '2 hours 59 minutes 59 seconds';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. Mover extensão pg_net para schema mais seguro
-- Primeiro criar schema se não existir
CREATE SCHEMA IF NOT EXISTS extensions;

-- Mover a extensão pg_net do schema public para extensions
-- NOTA: Isso pode ser feito através do dashboard do Supabase em Production
-- ou através de comandos SQL específicos do administrador

-- 4. Log das correções aplicadas
DO $$
BEGIN
  RAISE NOTICE 'Correções de segurança aplicadas:';
  RAISE NOTICE '1. Função ensure_daily_competition_end_time - search_path fixado';
  RAISE NOTICE '2. Função ensure_competition_standard_times - search_path fixado';
  RAISE NOTICE '3. Schema extensions criado para pg_net';
  RAISE NOTICE '4. Configurações de Auth devem ser ajustadas no dashboard';
  RAISE NOTICE 'RECOMENDAÇÃO: Ajustar OTP expiry para < 1 hora e ativar leaked password protection';
END $$;

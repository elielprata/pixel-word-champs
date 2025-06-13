
-- Reverter as competições para a terminologia original
UPDATE custom_competitions 
SET competition_type = 'challenge' 
WHERE competition_type = 'daily';

UPDATE custom_competitions 
SET competition_type = 'tournament' 
WHERE competition_type = 'weekly';

-- Reverter a função ensure_competition_standard_times() para usar os tipos originais
CREATE OR REPLACE FUNCTION ensure_competition_standard_times()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Reverter função de status das competições diárias
CREATE OR REPLACE FUNCTION update_daily_competition_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  brasilia_now TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Obter o horário atual em UTC (que já considera Brasília)
  brasilia_now := NOW();
  
  -- Finalizar competições diárias que passaram do horário de fim
  UPDATE custom_competitions 
  SET status = 'completed', updated_at = NOW()
  WHERE competition_type = 'challenge' 
    AND status = 'active'
    AND end_date < brasilia_now;
  
  -- Ativar competições diárias agendadas que chegaram no horário de início
  UPDATE custom_competitions 
  SET status = 'active', updated_at = NOW()
  WHERE competition_type = 'challenge' 
    AND status = 'scheduled'
    AND start_date <= brasilia_now
    AND end_date > brasilia_now;
    
  -- Log da execução
  RAISE NOTICE 'Daily competition status updated at %', brasilia_now;
END;
$$;

-- Reverter função de status das competições semanais
CREATE OR REPLACE FUNCTION update_competition_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  brasilia_now TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Obter o horário atual de Brasília (UTC-3)
  brasilia_now := NOW() AT TIME ZONE 'America/Sao_Paulo';
  
  -- Finalizar competições que passaram da data de fim
  UPDATE custom_competitions 
  SET status = 'completed', updated_at = NOW()
  WHERE competition_type = 'tournament' 
    AND status = 'active'
    AND end_date AT TIME ZONE 'America/Sao_Paulo' < brasilia_now;
  
  -- Ativar competições agendadas que chegaram na data de início
  UPDATE custom_competitions 
  SET status = 'active', updated_at = NOW()
  WHERE competition_type = 'tournament' 
    AND status = 'scheduled'
    AND start_date AT TIME ZONE 'America/Sao_Paulo' <= brasilia_now
    AND end_date AT TIME ZONE 'America/Sao_Paulo' > brasilia_now;
  
  -- Garantir que competições futuras fiquem como agendadas
  UPDATE custom_competitions 
  SET status = 'scheduled', updated_at = NOW()
  WHERE competition_type = 'tournament' 
    AND status = 'active'
    AND start_date AT TIME ZONE 'America/Sao_Paulo' > brasilia_now;
    
  -- Log da execução
  RAISE NOTICE 'Competition status updated at %', brasilia_now;
END;
$$;


-- 1. Corrigir todas as competições diárias existentes para terminarem às 23:59:59
UPDATE custom_competitions 
SET 
  end_date = DATE_TRUNC('day', start_date) + INTERVAL '23 hours 59 minutes 59 seconds',
  updated_at = NOW()
WHERE competition_type = 'challenge' 
  AND (
    EXTRACT(HOUR FROM end_date) != 23 
    OR EXTRACT(MINUTE FROM end_date) != 59 
    OR EXTRACT(SECOND FROM end_date) != 59
  );

-- 2. Criar função trigger para garantir que competições diárias sempre terminem às 23:59:59
CREATE OR REPLACE FUNCTION ensure_daily_competition_end_time()
RETURNS TRIGGER AS $$
BEGIN
  -- Se for uma competição diária (challenge), forçar fim às 23:59:59
  IF NEW.competition_type = 'challenge' THEN
    NEW.end_date := DATE_TRUNC('day', NEW.start_date) + INTERVAL '23 hours 59 minutes 59 seconds';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar trigger que executa antes de INSERT ou UPDATE
DROP TRIGGER IF EXISTS trigger_ensure_daily_competition_end_time ON custom_competitions;
CREATE TRIGGER trigger_ensure_daily_competition_end_time
  BEFORE INSERT OR UPDATE ON custom_competitions
  FOR EACH ROW
  EXECUTE FUNCTION ensure_daily_competition_end_time();

-- 4. Atualizar função de status para competições diárias considerando horário de Brasília
CREATE OR REPLACE FUNCTION update_daily_competition_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  brasilia_now TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Obter o horário atual de Brasília
  brasilia_now := NOW() AT TIME ZONE 'America/Sao_Paulo';
  
  -- Finalizar competições diárias que passaram das 23:59:59 do dia
  UPDATE custom_competitions 
  SET status = 'completed', updated_at = NOW()
  WHERE competition_type = 'challenge' 
    AND status = 'active'
    AND end_date AT TIME ZONE 'America/Sao_Paulo' < brasilia_now;
  
  -- Ativar competições diárias agendadas que chegaram no horário de início (00:00:00)
  UPDATE custom_competitions 
  SET status = 'active', updated_at = NOW()
  WHERE competition_type = 'challenge' 
    AND status = 'scheduled'
    AND start_date AT TIME ZONE 'America/Sao_Paulo' <= brasilia_now
    AND end_date AT TIME ZONE 'America/Sao_Paulo' > brasilia_now;
    
  -- Log da execução
  RAISE NOTICE 'Daily competition status updated at %', brasilia_now;
END;
$$;

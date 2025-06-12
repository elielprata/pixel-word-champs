
-- Corrigir o trigger para forçar horários padronizados para AMBOS os tipos de competição
CREATE OR REPLACE FUNCTION ensure_competition_standard_times()
RETURNS TRIGGER AS $$
BEGIN
  -- Para competições diárias (challenge): forçar início às 00:00:00 e fim às 23:59:59 do mesmo dia
  IF NEW.competition_type = 'challenge' THEN
    NEW.start_date := DATE_TRUNC('day', NEW.start_date) + INTERVAL '0 hours';
    NEW.end_date := DATE_TRUNC('day', NEW.start_date) + INTERVAL '23 hours 59 minutes 59 seconds';
  END IF;
  
  -- Para competições semanais (tournament): forçar início às 00:00:00 e fim às 23:59:59
  IF NEW.competition_type = 'tournament' THEN
    NEW.start_date := DATE_TRUNC('day', NEW.start_date) + INTERVAL '0 hours';
    NEW.end_date := DATE_TRUNC('day', NEW.end_date) + INTERVAL '23 hours 59 minutes 59 seconds';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Corrigir todas as competições diárias existentes com horário de início incorreto
UPDATE custom_competitions 
SET 
  start_date = DATE_TRUNC('day', start_date) + INTERVAL '0 hours',
  end_date = DATE_TRUNC('day', start_date) + INTERVAL '23 hours 59 minutes 59 seconds',
  updated_at = NOW()
WHERE competition_type = 'challenge' 
  AND (
    EXTRACT(HOUR FROM start_date) != 0 
    OR EXTRACT(MINUTE FROM start_date) != 0 
    OR EXTRACT(SECOND FROM start_date) != 0
    OR EXTRACT(HOUR FROM end_date) != 23 
    OR EXTRACT(MINUTE FROM end_date) != 59 
    OR EXTRACT(SECOND FROM end_date) != 59
  );

-- Verificar e corrigir competições semanais se necessário
UPDATE custom_competitions 
SET 
  start_date = DATE_TRUNC('day', start_date) + INTERVAL '0 hours',
  end_date = DATE_TRUNC('day', end_date) + INTERVAL '23 hours 59 minutes 59 seconds',
  updated_at = NOW()
WHERE competition_type = 'tournament' 
  AND (
    EXTRACT(HOUR FROM start_date) != 0 
    OR EXTRACT(MINUTE FROM start_date) != 0 
    OR EXTRACT(SECOND FROM start_date) != 0
    OR EXTRACT(HOUR FROM end_date) != 23 
    OR EXTRACT(MINUTE FROM end_date) != 59 
    OR EXTRACT(SECOND FROM end_date) != 59
  );

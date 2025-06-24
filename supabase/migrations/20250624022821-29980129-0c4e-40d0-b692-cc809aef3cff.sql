
-- Correção definitiva dos erros de timezone
-- Remove sintaxes incorretas e simplifica o sistema de datas

-- 1. Corrigir a função update_competition_status removendo sintaxe problemática
CREATE OR REPLACE FUNCTION public.update_competition_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  current_utc TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Usar UTC simples, sem conversões problemáticas
  current_utc := NOW();
  
  -- Finalizar competições que passaram da data de fim
  UPDATE custom_competitions 
  SET status = 'completed', updated_at = NOW()
  WHERE competition_type = 'tournament' 
    AND status = 'active'
    AND end_date < current_utc;
  
  -- Ativar competições agendadas que chegaram na data de início
  UPDATE custom_competitions 
  SET status = 'active', updated_at = NOW()
  WHERE competition_type = 'tournament' 
    AND status = 'scheduled'
    AND start_date <= current_utc
    AND end_date > current_utc;
  
  -- Garantir que competições futuras fiquem como agendadas
  UPDATE custom_competitions 
  SET status = 'scheduled', updated_at = NOW()
  WHERE competition_type = 'tournament' 
    AND status = 'active'
    AND start_date > current_utc;
    
  RAISE NOTICE 'Competition status updated at %', current_utc;
END;
$function$;

-- 2. Simplificar a função ensure_competition_standard_times
CREATE OR REPLACE FUNCTION ensure_competition_standard_times()
RETURNS TRIGGER AS $$
BEGIN
  -- Para competições diárias: preservar início, ajustar fim para 23:59:59 do mesmo dia
  IF NEW.competition_type = 'challenge' THEN
    -- Manter horário de início definido pelo usuário
    -- Ajustar fim para 23:59:59 do mesmo dia (UTC)
    NEW.end_date := date_trunc('day', NEW.start_date) + INTERVAL '23 hours 59 minutes 59 seconds';
  END IF;
  
  -- Para competições semanais: preservar início, ajustar fim para 23:59:59
  IF NEW.competition_type = 'tournament' THEN
    -- Manter horário de início definido pelo usuário
    -- Ajustar fim para 23:59:59 da data final (UTC)
    NEW.end_date := date_trunc('day', NEW.end_date) + INTERVAL '23 hours 59 minutes 59 seconds';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Recriar o trigger com a função corrigida
DROP TRIGGER IF EXISTS trigger_ensure_competition_standard_times ON custom_competitions;

CREATE TRIGGER trigger_ensure_competition_standard_times
  BEFORE INSERT OR UPDATE ON custom_competitions
  FOR EACH ROW
  EXECUTE FUNCTION ensure_competition_standard_times();

-- 4. Corrigir competições existentes com horários inconsistentes (usando UTC simples)
UPDATE custom_competitions 
SET 
  end_date = date_trunc('day', start_date) + INTERVAL '23 hours 59 minutes 59 seconds',
  updated_at = NOW()
WHERE competition_type = 'challenge' 
  AND (
    EXTRACT(HOUR FROM end_date) != 23 
    OR EXTRACT(MINUTE FROM end_date) != 59 
    OR EXTRACT(SECOND FROM end_date) != 59
  );

UPDATE custom_competitions 
SET 
  end_date = date_trunc('day', end_date) + INTERVAL '23 hours 59 minutes 59 seconds',
  updated_at = NOW()
WHERE competition_type = 'tournament' 
  AND (
    EXTRACT(HOUR FROM end_date) != 23 
    OR EXTRACT(MINUTE FROM end_date) != 59 
    OR EXTRACT(SECOND FROM end_date) != 59
  );

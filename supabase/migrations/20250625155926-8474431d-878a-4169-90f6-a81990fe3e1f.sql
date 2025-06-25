
-- Corrigir o trigger para respeitar durações customizadas das competições diárias
CREATE OR REPLACE FUNCTION ensure_competition_standard_times()
RETURNS TRIGGER AS $$
BEGIN
  -- Só aplicar correções se for uma inserção ou se as datas foram modificadas
  IF TG_OP = 'INSERT' OR 
     (TG_OP = 'UPDATE' AND (
       OLD.start_date IS DISTINCT FROM NEW.start_date OR 
       OLD.end_date IS DISTINCT FROM NEW.end_date
     )) THEN
    
    -- Para competições diárias: PRESERVAR a data de fim calculada pelo frontend
    -- Apenas validar se não ultrapassa o limite do mesmo dia
    IF NEW.competition_type = 'challenge' THEN
      -- Calcular o limite máximo do mesmo dia (23:59:59)
      DECLARE
        same_day_limit TIMESTAMP WITH TIME ZONE;
      BEGIN
        same_day_limit := date_trunc('day', NEW.start_date) + INTERVAL '23 hours 59 minutes 59 seconds';
        
        -- Se a data de fim calculada ultrapassar o limite do dia, ajustar
        -- Caso contrário, manter a data de fim original (que respeita a duração)
        IF NEW.end_date > same_day_limit THEN
          NEW.end_date := same_day_limit;
          RAISE NOTICE 'Data de fim ajustada para limite do dia: %', same_day_limit;
        ELSE
          -- Manter a data de fim original que respeita a duração configurada
          RAISE NOTICE 'Data de fim preservada (duração customizada): %', NEW.end_date;
        END IF;
      END;
    END IF;
    
    -- Para competições semanais: manter comportamento atual
    IF NEW.competition_type = 'tournament' THEN
      NEW.end_date := date_trunc('day', NEW.end_date) + INTERVAL '23 hours 59 minutes 59 seconds';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar o trigger
DROP TRIGGER IF EXISTS trigger_ensure_competition_standard_times ON custom_competitions;
CREATE TRIGGER trigger_ensure_competition_standard_times
  BEFORE INSERT OR UPDATE ON custom_competitions
  FOR EACH ROW
  EXECUTE FUNCTION ensure_competition_standard_times();

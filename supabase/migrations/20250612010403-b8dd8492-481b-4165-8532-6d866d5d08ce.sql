
-- Corrigir o trigger para não modificar datas quando apenas o status está sendo atualizado
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comentário explicativo sobre a correção
-- Este trigger agora só ajusta as datas quando:
-- 1. É uma inserção (INSERT)
-- 2. É uma atualização (UPDATE) E as datas start_date ou end_date foram realmente modificadas
-- Isso evita que mudanças de status alterem as datas originais das competições


-- Atualizar a função para permitir horários de início customizáveis
-- mantendo apenas o horário de fim fixo às 23:59:59
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
    
    -- Para competições diárias (challenge): 
    -- PRESERVAR o horário de início definido pelo usuário
    -- FORÇAR fim às 23:59:59 do mesmo dia (Brasília)
    IF NEW.competition_type = 'challenge' THEN
      -- Preservar data e horário de início exatos definidos pelo usuário
      -- Apenas ajustar o fim para 23:59:59 do mesmo dia em Brasília
      NEW.end_date := DATE_TRUNC('day', NEW.start_date AT TIME ZONE 'America/Sao_Paulo') 
                      + INTERVAL '23 hours 59 minutes 59 seconds'
                      AT TIME ZONE 'America/Sao_Paulo';
    END IF;
    
    -- Para competições semanais (tournament):
    -- PRESERVAR o horário de início definido pelo usuário  
    -- FORÇAR fim às 23:59:59 da data final (Brasília)
    IF NEW.competition_type = 'tournament' THEN
      -- Preservar horário de início exato definido pelo usuário
      -- Apenas ajustar o fim para 23:59:59 da data final em Brasília
      NEW.end_date := DATE_TRUNC('day', NEW.end_date AT TIME ZONE 'America/Sao_Paulo') 
                      + INTERVAL '23 hours 59 minutes 59 seconds'
                      AT TIME ZONE 'America/Sao_Paulo';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

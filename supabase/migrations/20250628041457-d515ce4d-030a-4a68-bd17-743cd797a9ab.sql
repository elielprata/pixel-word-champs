
-- Criar função para recalcular o total de prêmios de uma competição (corrigida)
CREATE OR REPLACE FUNCTION public.recalculate_competition_prize_pool(comp_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  total_prizes numeric := 0;
BEGIN
  -- Calcular total dos prêmios ativos
  SELECT COALESCE(SUM(prize_amount), 0) INTO total_prizes
  FROM monthly_invite_prizes 
  WHERE monthly_invite_prizes.competition_id = comp_id 
    AND active = true;
  
  -- Atualizar a competição
  UPDATE monthly_invite_competitions 
  SET 
    total_prize_pool = total_prizes,
    updated_at = NOW()
  WHERE id = comp_id;
  
  RETURN total_prizes;
END;
$function$;

-- Criar função trigger para sincronização automática
CREATE OR REPLACE FUNCTION public.sync_monthly_competition_prize_pool()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  affected_competition_id uuid;
BEGIN
  -- Determinar qual competição foi afetada
  IF TG_OP = 'DELETE' THEN
    affected_competition_id := OLD.competition_id;
  ELSE
    affected_competition_id := NEW.competition_id;
  END IF;
  
  -- Recalcular o pool de prêmios da competição afetada
  PERFORM recalculate_competition_prize_pool(affected_competition_id);
  
  -- Log da sincronização
  RAISE NOTICE 'Pool de prêmios da competição % sincronizado após %', affected_competition_id, TG_OP;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Criar trigger que dispara após INSERT, UPDATE ou DELETE em monthly_invite_prizes
DROP TRIGGER IF EXISTS trigger_sync_monthly_competition_prize_pool ON monthly_invite_prizes;
CREATE TRIGGER trigger_sync_monthly_competition_prize_pool
  AFTER INSERT OR UPDATE OR DELETE
  ON monthly_invite_prizes
  FOR EACH ROW
  EXECUTE FUNCTION sync_monthly_competition_prize_pool();

-- Corrigir dados existentes - sincronizar todas as competições
DO $$
DECLARE
  comp_record RECORD;
  total_calculated numeric;
BEGIN
  FOR comp_record IN 
    SELECT DISTINCT competition_id 
    FROM monthly_invite_prizes
  LOOP
    SELECT recalculate_competition_prize_pool(comp_record.competition_id) INTO total_calculated;
    RAISE NOTICE 'Competição % sincronizada: R$ %.2f', comp_record.competition_id, total_calculated;
  END LOOP;
END $$;

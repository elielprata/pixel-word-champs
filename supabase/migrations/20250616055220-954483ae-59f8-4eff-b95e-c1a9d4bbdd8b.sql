
-- 1. Zerar prize_pool para todas as competições diárias existentes
UPDATE custom_competitions 
SET prize_pool = 0 
WHERE competition_type = 'challenge';

-- 2. Criar trigger para garantir que competições diárias sempre tenham prize_pool = 0
CREATE OR REPLACE FUNCTION public.enforce_daily_competition_no_prizes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Se for uma competição diária (challenge), forçar prize_pool = 0
  IF NEW.competition_type = 'challenge' THEN
    NEW.prize_pool = 0;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. Criar trigger que executa antes de INSERT e UPDATE
DROP TRIGGER IF EXISTS enforce_daily_no_prizes_trigger ON custom_competitions;
CREATE TRIGGER enforce_daily_no_prizes_trigger
  BEFORE INSERT OR UPDATE ON custom_competitions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_daily_competition_no_prizes();

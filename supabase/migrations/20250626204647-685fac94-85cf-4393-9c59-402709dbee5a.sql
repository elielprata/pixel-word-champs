
-- Corrigir a função calculate_week_from_reference para calcular corretamente as semanas
CREATE OR REPLACE FUNCTION calculate_week_from_reference(target_date DATE, ref_date DATE DEFAULT '2025-06-01')
RETURNS TABLE(week_start DATE, week_end DATE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  target_day_of_week INTEGER;
  days_to_add INTEGER;
  calculated_start DATE;
BEGIN
  -- Calcular qual dia da semana é a data alvo (0=domingo, 1=segunda, ..., 6=sábado)
  target_day_of_week := EXTRACT(DOW FROM target_date);
  
  -- Se a data alvo for domingo (0), ela mesma é o início da semana
  IF target_day_of_week = 0 THEN
    week_start := target_date;
  ELSE
    -- Calcular quantos dias faltam para o próximo domingo
    days_to_add := 7 - target_day_of_week;
    week_start := target_date + days_to_add;
  END IF;
  
  -- Fim da semana é sempre sábado (6 dias após domingo)
  week_end := week_start + 6;
  
  RETURN NEXT;
END;
$function$;

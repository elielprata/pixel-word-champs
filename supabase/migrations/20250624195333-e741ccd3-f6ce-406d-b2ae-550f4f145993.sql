
-- Corrigir a função calculate_prize_for_position para aceitar bigint
CREATE OR REPLACE FUNCTION public.calculate_prize_for_position(user_position bigint)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  individual_prize numeric := 0;
  group_prize numeric := 0;
  final_prize numeric := 0;
BEGIN
  -- Verificar prêmio individual primeiro
  SELECT COALESCE(prize_amount, 0) INTO individual_prize
  FROM prize_configurations
  WHERE type = 'individual' 
    AND position = user_position 
    AND active = true
  LIMIT 1;
  
  -- Se não encontrou prêmio individual, verificar prêmios em grupo
  IF individual_prize = 0 THEN
    SELECT COALESCE(prize_amount, 0) INTO group_prize
    FROM prize_configurations
    WHERE type = 'group' 
      AND active = true
      AND position_range IS NOT NULL
      AND user_position = ANY(
        string_to_array(regexp_replace(position_range, '[^0-9,]', '', 'g'), ',')::int[]
      )
    LIMIT 1;
    
    final_prize := group_prize;
  ELSE
    final_prize := individual_prize;
  END IF;
  
  RETURN final_prize;
END;
$function$;

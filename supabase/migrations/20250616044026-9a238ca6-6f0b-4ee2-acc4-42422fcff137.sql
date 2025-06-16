
-- Limpar duplicatas na tabela weekly_rankings
DELETE FROM public.weekly_rankings a
USING public.weekly_rankings b
WHERE a.id > b.id 
  AND a.user_id = b.user_id 
  AND a.week_start = b.week_start 
  AND a.week_end = b.week_end;

-- Corrigir a função update_weekly_ranking para usar dados corretos
DROP FUNCTION IF EXISTS public.update_weekly_ranking();

CREATE OR REPLACE FUNCTION public.update_weekly_ranking()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  week_start_date DATE;
  week_end_date DATE;
  affected_rows INTEGER;
BEGIN
  -- Log de início
  RAISE NOTICE 'Iniciando atualização do ranking semanal';
  
  -- Calcular início e fim da semana (segunda a domingo)
  week_start_date := DATE_TRUNC('week', CURRENT_DATE)::DATE;
  week_end_date := week_start_date + INTERVAL '6 days';
  
  RAISE NOTICE 'Semana: % a %', week_start_date, week_end_date;
  
  -- Deletar rankings da semana atual para evitar duplicatas
  DELETE FROM public.weekly_rankings 
  WHERE week_start = week_start_date AND week_end = week_end_date;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE 'Deletados % registros antigos', affected_rows;
  
  -- Inserir novos rankings baseados na pontuação total dos perfis
  WITH ranked_users AS (
    SELECT 
      p.id as user_id,
      p.username,
      p.pix_key,
      p.pix_holder_name,
      ROW_NUMBER() OVER (ORDER BY COALESCE(p.total_score, 0) DESC) as position,
      COALESCE(p.total_score, 0) as score
    FROM public.profiles p
    WHERE COALESCE(p.total_score, 0) > 0
  )
  INSERT INTO public.weekly_rankings (
    user_id, username, pix_key, pix_holder_name,
    week_start, week_end, position, total_score, 
    prize_amount, payment_status
  )
  SELECT 
    user_id,
    username,
    pix_key,
    pix_holder_name,
    week_start_date,
    week_end_date,
    position,
    score,
    CASE 
      WHEN position = 1 THEN 100.00
      WHEN position = 2 THEN 50.00
      WHEN position = 3 THEN 25.00
      WHEN position <= 10 THEN 10.00
      ELSE 0
    END as prize_amount,
    CASE 
      WHEN position <= 10 THEN 'pending'
      ELSE 'not_eligible'
    END as payment_status
  FROM ranked_users;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE 'Inseridos % novos registros no ranking', affected_rows;
  
  RAISE NOTICE 'Atualização do ranking semanal concluída com sucesso';
END;
$function$;

-- Executar a função uma vez para criar o ranking inicial limpo
SELECT public.update_weekly_ranking();

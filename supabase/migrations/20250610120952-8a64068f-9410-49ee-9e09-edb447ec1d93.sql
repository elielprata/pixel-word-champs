
-- Criar o enum payment_status primeiro, fora da função
DO $$ 
BEGIN
    -- Primeiro, remover o tipo se já existir para evitar conflitos
    DROP TYPE IF EXISTS payment_status CASCADE;
    
    -- Criar o tipo payment_status
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'not_eligible');
    
    RAISE NOTICE 'Enum payment_status criado com sucesso';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao criar enum: %', SQLERRM;
END $$;

-- Agora recriar a função sem a lógica de criação do enum
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
  
  -- Deletar rankings da semana atual
  DELETE FROM public.weekly_rankings 
  WHERE week_start = week_start_date AND week_end = week_end_date;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE 'Deletados % registros antigos', affected_rows;
  
  -- Inserir novos rankings baseados na pontuação total dos perfis
  WITH ranked_users AS (
    SELECT 
      id as user_id,
      ROW_NUMBER() OVER (ORDER BY COALESCE(total_score, 0) DESC) as position,
      COALESCE(total_score, 0) as score
    FROM public.profiles
    WHERE COALESCE(total_score, 0) > 0
  )
  INSERT INTO public.weekly_rankings (user_id, week_start, week_end, position, score, prize, payment_status)
  SELECT 
    user_id,
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
    END as prize,
    CASE 
      WHEN position <= 10 THEN 'pending'::payment_status
      ELSE 'not_eligible'::payment_status
    END as payment_status
  FROM ranked_users;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE 'Inseridos % novos registros no ranking', affected_rows;
  
  RAISE NOTICE 'Atualização do ranking semanal concluída com sucesso';
END;
$function$;

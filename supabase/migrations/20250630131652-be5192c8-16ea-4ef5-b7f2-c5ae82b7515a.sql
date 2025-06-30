
-- FASE 1: LIMPEZA DE DUPLICATAS EXISTENTES

-- 1. Identificar e remover duplicatas, mantendo apenas o registro mais recente
WITH ranked_duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, week_start, week_end 
      ORDER BY updated_at DESC, created_at DESC
    ) as rn
  FROM weekly_rankings
)
DELETE FROM weekly_rankings 
WHERE id IN (
  SELECT id FROM ranked_duplicates WHERE rn > 1
);

-- 2. Criar constraint UNIQUE para prevenir duplicatas futuras
ALTER TABLE weekly_rankings 
ADD CONSTRAINT unique_user_week_ranking 
UNIQUE (user_id, week_start, week_end);

-- 3. Criar índice para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_weekly_rankings_user_week 
ON weekly_rankings (user_id, week_start, week_end);

-- 4. Melhorar a função update_weekly_ranking com UPSERT robusto
CREATE OR REPLACE FUNCTION public.update_weekly_ranking()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  week_start_date DATE;
  week_end_date DATE;
  affected_rows INTEGER;
  config_record RECORD;
BEGIN
  RAISE NOTICE 'Iniciando atualização robusta do ranking semanal';
  
  -- Buscar configuração ativa
  SELECT * INTO config_record 
  FROM weekly_config 
  WHERE status = 'active' 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Se não houver configuração, não fazer nada
  IF config_record IS NULL THEN
    RAISE NOTICE 'Nenhuma configuração ativa encontrada';
    RETURN;
  END IF;
  
  -- Usar as datas configuradas
  week_start_date := config_record.start_date;
  week_end_date := config_record.end_date;
  
  RAISE NOTICE 'Atualizando ranking para semana: % a %', week_start_date, week_end_date;
  
  -- USAR UPSERT ROBUSTO para evitar duplicatas
  WITH ranked_users AS (
    SELECT 
      p.id as user_id,
      p.username,
      p.pix_key,
      p.pix_holder_name,
      ROW_NUMBER() OVER (ORDER BY COALESCE(p.total_score, 0) DESC) as position,
      COALESCE(p.total_score, 0) as score
    FROM profiles p
    WHERE COALESCE(p.total_score, 0) > 0
  ),
  prize_calculation AS (
    SELECT 
      user_id,
      username,
      pix_key,
      pix_holder_name,
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
    FROM ranked_users
  )
  INSERT INTO weekly_rankings (
    user_id, username, pix_key, pix_holder_name,
    week_start, week_end, position, total_score, 
    prize_amount, payment_status, created_at, updated_at
  )
  SELECT 
    user_id, username, pix_key, pix_holder_name,
    week_start_date, week_end_date, position, score,
    prize_amount, payment_status, NOW(), NOW()
  FROM prize_calculation
  ON CONFLICT (user_id, week_start, week_end) 
  DO UPDATE SET
    username = EXCLUDED.username,
    pix_key = EXCLUDED.pix_key,
    pix_holder_name = EXCLUDED.pix_holder_name,
    position = EXCLUDED.position,
    total_score = EXCLUDED.total_score,
    prize_amount = EXCLUDED.prize_amount,
    payment_status = EXCLUDED.payment_status,
    updated_at = NOW();
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE 'Processados % registros no ranking (sem duplicatas)', affected_rows;
  
  -- Remover usuários que não deveriam mais estar no ranking
  DELETE FROM weekly_rankings wr
  WHERE week_start = week_start_date 
    AND week_end = week_end_date
    AND NOT EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = wr.user_id AND COALESCE(p.total_score, 0) > 0
    );
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE 'Removidos % registros obsoletos', affected_rows;
  
  RAISE NOTICE 'Atualização do ranking concluída sem duplicatas';
END;
$function$;

-- 5. Criar função para detectar duplicatas
CREATE OR REPLACE FUNCTION public.detect_ranking_duplicates()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  duplicate_count INTEGER;
  duplicates_data jsonb;
BEGIN
  -- Contar duplicatas
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT user_id, week_start, week_end, COUNT(*) as cnt
    FROM weekly_rankings
    GROUP BY user_id, week_start, week_end
    HAVING COUNT(*) > 1
  ) duplicates;
  
  -- Obter dados das duplicatas
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'user_id', user_id,
      'week_start', week_start,
      'week_end', week_end,
      'count', cnt
    )
  ), '[]'::jsonb) INTO duplicates_data
  FROM (
    SELECT user_id, week_start, week_end, COUNT(*) as cnt
    FROM weekly_rankings
    GROUP BY user_id, week_start, week_end
    HAVING COUNT(*) > 1
  ) duplicates;
  
  RETURN jsonb_build_object(
    'duplicate_count', duplicate_count,
    'duplicates', duplicates_data,
    'checked_at', NOW()
  );
END;
$function$;

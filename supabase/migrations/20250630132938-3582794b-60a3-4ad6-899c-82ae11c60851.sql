
-- Fase 1: Limpeza de duplicatas existentes
-- Identificar e remover duplicatas, mantendo apenas o registro mais recente por (user_id, week_start)
WITH duplicates_to_remove AS (
  SELECT id
  FROM (
    SELECT id, 
           ROW_NUMBER() OVER (
             PARTITION BY user_id, week_start 
             ORDER BY updated_at DESC, created_at DESC
           ) as rn
    FROM weekly_rankings
  ) ranked
  WHERE rn > 1
)
DELETE FROM weekly_rankings 
WHERE id IN (SELECT id FROM duplicates_to_remove);

-- Remover constraint única existente (se existir)
ALTER TABLE weekly_rankings DROP CONSTRAINT IF EXISTS weekly_rankings_user_id_week_start_week_end_key;

-- Criar nova constraint única robusta baseada apenas em (user_id, week_start)
ALTER TABLE weekly_rankings ADD CONSTRAINT weekly_rankings_user_week_unique 
UNIQUE (user_id, week_start);

-- Fase 2: Corrigir função update_weekly_ranking() com UPSERT robusto
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
  
  -- UPSERT ROBUSTO baseado em (user_id, week_start)
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
  ON CONFLICT (user_id, week_start) 
  DO UPDATE SET
    username = EXCLUDED.username,
    pix_key = EXCLUDED.pix_key,
    pix_holder_name = EXCLUDED.pix_holder_name,
    week_end = EXCLUDED.week_end,  -- Sempre atualizar week_end para consistência
    position = EXCLUDED.position,
    total_score = EXCLUDED.total_score,
    prize_amount = EXCLUDED.prize_amount,
    payment_status = EXCLUDED.payment_status,
    updated_at = NOW();
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE 'Processados % registros no ranking (UPSERT robusto)', affected_rows;
  
  -- Remover usuários que não deveriam mais estar no ranking (score = 0)
  DELETE FROM weekly_rankings wr
  WHERE week_start = week_start_date 
    AND NOT EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = wr.user_id AND COALESCE(p.total_score, 0) > 0
    );
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE 'Removidos % registros obsoletos', affected_rows;
  
  RAISE NOTICE 'Atualização robusta do ranking concluída com UPSERT baseado em (user_id, week_start)';
END;
$function$;

-- Log da correção
INSERT INTO automation_logs (
  automation_type,
  scheduled_time,
  executed_at,
  execution_status,
  affected_users,
  settings_snapshot
) VALUES (
  'ranking_duplication_fix',
  NOW(),
  NOW(),
  'completed',
  0,
  jsonb_build_object(
    'action', 'removed_duplicates_and_added_robust_constraint',
    'constraint_added', 'weekly_rankings_user_week_unique (user_id, week_start)',
    'function_updated', 'update_weekly_ranking() with robust UPSERT'
  )
);

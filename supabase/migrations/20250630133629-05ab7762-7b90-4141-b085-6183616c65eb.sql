
-- Corrigir função update_weekly_ranking() para usar prize_configurations dinâmicamente
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
  RAISE NOTICE 'Iniciando atualização robusta do ranking semanal com premiação dinâmica';
  
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
  
  -- UPSERT ROBUSTO baseado em (user_id, week_start) com premiação dinâmica
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
      -- Usar função calculate_prize_for_position para obter premiação dinâmica
      calculate_prize_for_position(position::bigint) as prize_amount,
      CASE 
        WHEN calculate_prize_for_position(position::bigint) > 0 THEN 'pending'
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
    week_end = EXCLUDED.week_end,
    position = EXCLUDED.position,
    total_score = EXCLUDED.total_score,
    prize_amount = EXCLUDED.prize_amount,
    payment_status = EXCLUDED.payment_status,
    updated_at = NOW();
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE 'Processados % registros no ranking (UPSERT robusto com premiação dinâmica)', affected_rows;
  
  -- Remover usuários que não deveriam mais estar no ranking (score = 0)
  DELETE FROM weekly_rankings wr
  WHERE week_start = week_start_date 
    AND NOT EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = wr.user_id AND COALESCE(p.total_score, 0) > 0
    );
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE 'Removidos % registros obsoletos', affected_rows;
  
  RAISE NOTICE 'Atualização robusta do ranking concluída com UPSERT baseado em (user_id, week_start) e premiação dinâmica';
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
  'prize_calculation_fix',
  NOW(),
  NOW(),
  'completed',
  0,
  jsonb_build_object(
    'action', 'updated_weekly_ranking_function_with_dynamic_prizes',
    'function_updated', 'update_weekly_ranking() now uses calculate_prize_for_position()',
    'old_method', 'hardcoded_prize_values',
    'new_method', 'dynamic_prize_configurations_table'
  )
);

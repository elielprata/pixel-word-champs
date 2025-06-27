
-- Corrigir a função get_weekly_ranking_stats para usar a coluna 'status' correta
CREATE OR REPLACE FUNCTION public.get_weekly_ranking_stats()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_week_start date;
  current_week_end date;
  config_record RECORD;
  stats jsonb;
  calculated_prize_pool numeric := 0;
BEGIN
  -- Buscar configuração ativa (corrigido: usar status = 'active' ao invés de is_active = true)
  SELECT * INTO config_record 
  FROM weekly_config 
  WHERE status = 'active' 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Se não houver configuração, retornar erro
  IF config_record IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'Nenhuma configuração de competição encontrada',
      'current_week_start', null,
      'current_week_end', null,
      'total_participants', 0,
      'total_prize_pool', 0
    );
  END IF;
  
  -- Usar as datas configuradas
  current_week_start := config_record.start_date;
  current_week_end := config_record.end_date;
  
  -- Calcular pool de prêmios baseado nas configurações ativas
  SELECT COALESCE(SUM(
    CASE 
      WHEN pc.type = 'individual' THEN pc.prize_amount
      WHEN pc.type = 'group' THEN pc.prize_amount * pc.total_winners
      ELSE 0
    END
  ), 0) INTO calculated_prize_pool
  FROM prize_configurations pc
  WHERE pc.active = true;
  
  -- Compilar estatísticas
  SELECT jsonb_build_object(
    'current_week_start', current_week_start,
    'current_week_end', current_week_end,
    'config', jsonb_build_object(
      'start_date', config_record.start_date,
      'end_date', config_record.end_date
    ),
    'total_participants', (
      SELECT count(*) FROM profiles WHERE total_score > 0
    ),
    'total_prize_pool', calculated_prize_pool,
    'last_update', (
      SELECT COALESCE(max(updated_at), now()) FROM weekly_rankings 
      WHERE week_start = current_week_start
    ),
    'top_3_players', (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'username', username,
            'score', total_score,
            'position', position,
            'prize', prize_amount
          ) ORDER BY position
        ), 
        '[]'::jsonb
      )
      FROM weekly_rankings 
      WHERE week_start = current_week_start 
        AND position <= 3
    )
  ) INTO stats;
  
  RETURN stats;
END;
$function$;

-- Corrigir também a função update_weekly_ranking para usar status correto
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
  -- Log de início
  RAISE NOTICE 'Iniciando atualização do ranking semanal simplificado';
  
  -- Buscar configuração ativa (corrigido: usar status = 'active')
  SELECT * INTO config_record 
  FROM weekly_config 
  WHERE status = 'active' 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Se não houver configuração, não fazer nada
  IF config_record IS NULL THEN
    RAISE NOTICE 'Nenhuma configuração encontrada, cancelando atualização';
    RETURN;
  END IF;
  
  -- Usar as datas configuradas
  week_start_date := config_record.start_date;
  week_end_date := config_record.end_date;
  
  RAISE NOTICE 'Competição configurada: % a %', week_start_date, week_end_date;
  
  -- USAR UPSERT ao invés de DELETE + INSERT para evitar duplicatas
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
      calculate_prize_for_position(position) as prize_amount,
      CASE 
        WHEN calculate_prize_for_position(position) > 0 THEN 'pending'
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
  RAISE NOTICE 'Processados % registros no ranking simplificado', affected_rows;
  
  -- Remover usuários que não deveriam mais estar no ranking (score = 0)
  DELETE FROM weekly_rankings wr
  WHERE week_start = week_start_date 
    AND week_end = week_end_date
    AND NOT EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = wr.user_id AND COALESCE(p.total_score, 0) > 0
    );
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE 'Removidos % registros obsoletos do ranking', affected_rows;
  
  RAISE NOTICE 'Atualização do ranking semanal simplificado concluída';
END;
$function$;


-- Corrigir a migração: primeiro definir valores padrão para registros existentes
-- 1. Atualizar registros existentes com valores nulos
UPDATE weekly_config 
SET 
  custom_start_date = COALESCE(custom_start_date, current_date),
  custom_end_date = COALESCE(custom_end_date, current_date + 7)
WHERE custom_start_date IS NULL OR custom_end_date IS NULL;

-- 2. Agora tornar as colunas obrigatórias
ALTER TABLE weekly_config 
ALTER COLUMN custom_start_date SET NOT NULL,
ALTER COLUMN custom_end_date SET NOT NULL;

-- 3. Renomear as colunas para nomes mais simples
ALTER TABLE weekly_config 
RENAME COLUMN custom_start_date TO start_date;

ALTER TABLE weekly_config 
RENAME COLUMN custom_end_date TO end_date;

-- 4. Remover colunas desnecessárias
ALTER TABLE weekly_config 
DROP COLUMN IF EXISTS reference_date,
DROP COLUMN IF EXISTS start_day_of_week,
DROP COLUMN IF EXISTS duration_days;

-- 5. Remover função calculate_week_from_reference que não será mais necessária
DROP FUNCTION IF EXISTS calculate_week_from_reference(DATE, DATE);

-- 6. Atualizar função get_weekly_ranking_stats para usar apenas datas customizadas
CREATE OR REPLACE FUNCTION get_weekly_ranking_stats()
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
  -- Buscar configuração ativa
  SELECT * INTO config_record 
  FROM weekly_config 
  WHERE is_active = true 
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

-- 7. Atualizar função should_reset_weekly_ranking para usar apenas datas customizadas
CREATE OR REPLACE FUNCTION should_reset_weekly_ranking()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  config_record RECORD;
  should_reset BOOLEAN := false;
  reset_info jsonb;
BEGIN
  -- Buscar configuração ativa
  SELECT * INTO config_record 
  FROM weekly_config 
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Se não houver configuração, retornar sem resetar
  IF config_record IS NULL THEN
    RETURN jsonb_build_object(
      'should_reset', false,
      'error', 'Nenhuma configuração encontrada'
    );
  END IF;
  
  -- Verificar se deve resetar (passou do fim da competição)
  should_reset := current_date > config_record.end_date;
  
  -- Compilar informações do reset
  SELECT jsonb_build_object(
    'should_reset', should_reset,
    'current_date', current_date,
    'week_start', config_record.start_date,
    'week_end', config_record.end_date,
    'next_reset_date', config_record.end_date + 1,
    'config', jsonb_build_object(
      'start_date', config_record.start_date,
      'end_date', config_record.end_date
    )
  ) INTO reset_info;
  
  RETURN reset_info;
END;
$function$;

-- 8. Atualizar função update_weekly_ranking para usar apenas datas customizadas
CREATE OR REPLACE FUNCTION update_weekly_ranking()
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
  
  -- Buscar configuração ativa
  SELECT * INTO config_record 
  FROM weekly_config 
  WHERE is_active = true 
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

-- 9. Atualizar função reset_weekly_scores_and_positions para usar apenas datas customizadas
CREATE OR REPLACE FUNCTION reset_weekly_scores_and_positions()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  affected_profiles INTEGER;
  affected_rankings INTEGER;
  config_record RECORD;
  week_start_date DATE;
  week_end_date DATE;
BEGIN
  -- Buscar configuração ativa
  SELECT * INTO config_record 
  FROM weekly_config 
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Se não houver configuração, retornar erro
  IF config_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Nenhuma configuração encontrada'
    );
  END IF;
  
  -- Usar as datas configuradas
  week_start_date := config_record.start_date;
  week_end_date := config_record.end_date;
  
  -- Resetar pontuações dos perfis
  UPDATE profiles 
  SET 
    total_score = 0,
    best_weekly_position = NULL,
    updated_at = NOW()
  WHERE total_score > 0 OR best_weekly_position IS NOT NULL;
  
  GET DIAGNOSTICS affected_profiles = ROW_COUNT;
  
  -- Limpar ranking da competição atual
  DELETE FROM weekly_rankings 
  WHERE week_start = week_start_date AND week_end = week_end_date;
  
  GET DIAGNOSTICS affected_rankings = ROW_COUNT;
  
  -- Registrar ação no log de automação
  INSERT INTO automation_logs (
    automation_type,
    scheduled_time,
    executed_at,
    execution_status,
    affected_users,
    settings_snapshot
  ) VALUES (
    'manual_weekly_reset',
    NOW(),
    NOW(),
    'completed',
    affected_profiles,
    jsonb_build_object(
      'competition_start', week_start_date,
      'competition_end', week_end_date,
      'profiles_reset', affected_profiles,
      'rankings_cleared', affected_rankings
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'profiles_reset', affected_profiles,
    'rankings_cleared', affected_rankings,
    'competition_start', week_start_date,
    'competition_end', week_end_date,
    'reset_at', NOW()
  );
END;
$function$;

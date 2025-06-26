
-- Adicionar coluna de data de referência à tabela weekly_config
ALTER TABLE weekly_config 
ADD COLUMN reference_date DATE DEFAULT '2025-06-01';

-- Atualizar a configuração ativa para ter a data de referência
UPDATE weekly_config 
SET reference_date = '2025-06-01'
WHERE is_active = true;

-- Criar função para calcular semana baseada na data de referência
CREATE OR REPLACE FUNCTION calculate_week_from_reference(target_date DATE, ref_date DATE DEFAULT '2025-06-01')
RETURNS TABLE(week_start DATE, week_end DATE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  days_diff INTEGER;
  weeks_diff INTEGER;
  calculated_start DATE;
  calculated_end DATE;
BEGIN
  -- Calcular diferença em dias desde a referência
  days_diff := target_date - ref_date;
  
  -- Calcular número de semanas completas
  weeks_diff := FLOOR(days_diff / 7.0);
  
  -- Calcular início da semana (sempre domingo)
  calculated_start := ref_date + (weeks_diff * 7);
  
  -- Se a data alvo é antes do próximo domingo, usar a semana atual
  IF target_date < calculated_start + 7 THEN
    week_start := calculated_start;
  ELSE
    week_start := calculated_start + 7;
  END IF;
  
  -- Fim da semana é sempre sábado (6 dias após domingo)
  week_end := week_start + 6;
  
  RETURN NEXT;
END;
$function$;

-- Atualizar função should_reset_weekly_ranking para usar referência
CREATE OR REPLACE FUNCTION should_reset_weekly_ranking()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  config_record RECORD;
  week_dates RECORD;
  should_reset BOOLEAN := false;
  reset_info jsonb;
BEGIN
  -- Buscar configuração ativa
  SELECT * INTO config_record 
  FROM weekly_config 
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Se não houver configuração, usar valores padrão
  IF config_record IS NULL THEN
    config_record.reference_date := '2025-06-01';
    config_record.start_day_of_week := 0;
    config_record.duration_days := 7;
    config_record.custom_start_date := NULL;
    config_record.custom_end_date := NULL;
  END IF;
  
  -- PRIORIZAR datas customizadas se existirem
  IF config_record.custom_start_date IS NOT NULL AND config_record.custom_end_date IS NOT NULL THEN
    -- Usar datas específicas configuradas pelo usuário
    week_dates.week_start := config_record.custom_start_date;
    week_dates.week_end := config_record.custom_end_date;
  ELSE
    -- Usar sistema de referência para calcular semana atual
    SELECT * INTO week_dates 
    FROM calculate_week_from_reference(current_date, config_record.reference_date);
  END IF;
  
  -- Verificar se deve resetar (passou do fim da semana)
  should_reset := current_date > week_dates.week_end;
  
  -- Compilar informações do reset
  SELECT jsonb_build_object(
    'should_reset', should_reset,
    'current_date', current_date,
    'week_start', week_dates.week_start,
    'week_end', week_dates.week_end,
    'next_reset_date', week_dates.week_end + 1,
    'is_custom_dates', (config_record.custom_start_date IS NOT NULL AND config_record.custom_end_date IS NOT NULL),
    'reference_date', config_record.reference_date,
    'config', jsonb_build_object(
      'start_day_of_week', config_record.start_day_of_week,
      'duration_days', config_record.duration_days,
      'custom_start_date', config_record.custom_start_date,
      'custom_end_date', config_record.custom_end_date,
      'reference_date', config_record.reference_date
    )
  ) INTO reset_info;
  
  RETURN reset_info;
END;
$function$;

-- Atualizar função get_weekly_ranking_stats para usar referência
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
  week_dates RECORD;
  stats jsonb;
  calculated_prize_pool numeric := 0;
BEGIN
  -- Buscar configuração ativa
  SELECT * INTO config_record 
  FROM weekly_config 
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Se não houver configuração, usar valores padrão
  IF config_record IS NULL THEN
    config_record.reference_date := '2025-06-01';
    config_record.start_day_of_week := 0;
    config_record.duration_days := 7;
    config_record.custom_start_date := NULL;
    config_record.custom_end_date := NULL;
  END IF;
  
  -- PRIORIZAR datas customizadas se existirem
  IF config_record.custom_start_date IS NOT NULL AND config_record.custom_end_date IS NOT NULL THEN
    -- Usar datas específicas configuradas pelo usuário
    current_week_start := config_record.custom_start_date;
    current_week_end := config_record.custom_end_date;
  ELSE
    -- Usar sistema de referência para calcular semana atual
    SELECT * INTO week_dates 
    FROM calculate_week_from_reference(current_date, config_record.reference_date);
    
    current_week_start := week_dates.week_start;
    current_week_end := week_dates.week_end;
  END IF;
  
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
      'start_day_of_week', config_record.start_day_of_week,
      'duration_days', config_record.duration_days,
      'custom_start_date', config_record.custom_start_date,
      'custom_end_date', config_record.custom_end_date,
      'reference_date', config_record.reference_date
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

-- Atualizar função update_weekly_ranking para usar referência
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
  week_dates RECORD;
BEGIN
  -- Log de início
  RAISE NOTICE 'Iniciando atualização do ranking semanal com sistema de referência';
  
  -- Buscar configuração ativa
  SELECT * INTO config_record 
  FROM weekly_config 
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Se não houver configuração, usar valores padrão
  IF config_record IS NULL THEN
    config_record.reference_date := '2025-06-01';
    config_record.start_day_of_week := 0;
    config_record.duration_days := 7;
    config_record.custom_start_date := NULL;
    config_record.custom_end_date := NULL;
  END IF;
  
  -- PRIORIZAR datas customizadas se existirem
  IF config_record.custom_start_date IS NOT NULL AND config_record.custom_end_date IS NOT NULL THEN
    -- Usar datas específicas configuradas pelo usuário
    week_start_date := config_record.custom_start_date;
    week_end_date := config_record.custom_end_date;
  ELSE
    -- Usar sistema de referência para calcular semana atual
    SELECT * INTO week_dates 
    FROM calculate_week_from_reference(current_date, config_record.reference_date);
    
    week_start_date := week_dates.week_start;
    week_end_date := week_dates.week_end;
  END IF;
  
  RAISE NOTICE 'Semana calculada com referência %: % a %', 
    config_record.reference_date, week_start_date, week_end_date;
  
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
  RAISE NOTICE 'Processados % registros no ranking usando sistema de referência', affected_rows;
  
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
  
  RAISE NOTICE 'Atualização do ranking semanal concluída com sistema de referência';
END;
$function$;

-- Adicionar comentário para documentar a importância da data de referência
COMMENT ON COLUMN weekly_config.reference_date IS 
'DATA DE REFERÊNCIA FIXA (01/06/2025 - DOMINGO): Esta data NUNCA deve ser alterada pois serve como ponto zero para todos os cálculos de semanas. Modificar esta data causará inconsistências em todo o sistema de ranking semanal.';

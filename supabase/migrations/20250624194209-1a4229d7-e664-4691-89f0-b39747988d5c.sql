
-- Atualizar a função get_weekly_ranking_stats para usar prize_configurations
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
  -- Buscar configuração ativa
  SELECT * INTO config_record 
  FROM weekly_config 
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Se não houver configuração, usar padrão (domingo a sábado)
  IF config_record IS NULL THEN
    config_record.start_day_of_week := 0;
    config_record.duration_days := 7;
    config_record.custom_start_date := NULL;
    config_record.custom_end_date := NULL;
  END IF;
  
  -- Calcular período baseado na configuração
  IF config_record.custom_start_date IS NOT NULL AND config_record.custom_end_date IS NOT NULL THEN
    -- Usar datas específicas
    current_week_start := config_record.custom_start_date;
    current_week_end := config_record.custom_end_date;
  ELSE
    -- Calcular baseado no dia da semana e duração
    current_week_start := date_trunc('week', current_date)::date + (config_record.start_day_of_week || ' days')::interval;
    
    -- Ajustar se a semana calculada está no futuro
    IF current_week_start > current_date THEN
      current_week_start := current_week_start - interval '7 days';
    END IF;
    
    current_week_end := current_week_start + (config_record.duration_days - 1 || ' days')::interval;
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
      'custom_end_date', config_record.custom_end_date
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

-- Criar função auxiliar para calcular prêmio por posição
CREATE OR REPLACE FUNCTION public.calculate_prize_for_position(user_position integer)
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

-- Atualizar função update_weekly_ranking para usar prize_configurations
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
  RAISE NOTICE 'Iniciando atualização robusta do ranking semanal';
  
  -- Buscar configuração ativa
  SELECT * INTO config_record 
  FROM weekly_config 
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Se não houver configuração, usar padrão (domingo a sábado)
  IF config_record IS NULL THEN
    week_start_date := DATE_TRUNC('week', CURRENT_DATE)::DATE;
    week_end_date := week_start_date + INTERVAL '6 days';
  ELSIF config_record.custom_start_date IS NOT NULL AND config_record.custom_end_date IS NOT NULL THEN
    -- Usar datas específicas
    week_start_date := config_record.custom_start_date;
    week_end_date := config_record.custom_end_date;
  ELSE
    -- Calcular baseado no dia da semana e duração
    week_start_date := date_trunc('week', current_date)::date + (config_record.start_day_of_week || ' days')::interval;
    
    -- Ajustar se a semana calculada está no futuro
    IF week_start_date > current_date THEN
      week_start_date := week_start_date - interval '7 days';
    END IF;
    
    week_end_date := week_start_date + (config_record.duration_days - 1 || ' days')::interval;
  END IF;
  
  RAISE NOTICE 'Semana: % a %', week_start_date, week_end_date;
  
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
  RAISE NOTICE 'Processados % registros no ranking (upsert)', affected_rows;
  
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
  
  RAISE NOTICE 'Atualização robusta do ranking semanal concluída com sucesso';
END;
$function$;


-- Corrigir função update_weekly_ranking para usar datas customizadas consistentemente
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
    -- PRIORIZAR datas específicas configuradas pelo usuário
    week_start_date := config_record.custom_start_date;
    week_end_date := config_record.custom_end_date;
  ELSE
    -- Calcular baseado no dia da semana e duração apenas se não houver datas customizadas
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

-- Corrigir função reset_weekly_scores_and_positions para usar datas customizadas consistentemente
CREATE OR REPLACE FUNCTION public.reset_weekly_scores_and_positions()
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
  
  -- Calcular período da semana atual usando a mesma lógica das outras funções
  IF config_record IS NULL THEN
    week_start_date := DATE_TRUNC('week', CURRENT_DATE)::DATE;
    week_end_date := week_start_date + INTERVAL '6 days';
  ELSIF config_record.custom_start_date IS NOT NULL AND config_record.custom_end_date IS NOT NULL THEN
    -- PRIORIZAR datas específicas configuradas pelo usuário
    week_start_date := config_record.custom_start_date;
    week_end_date := config_record.custom_end_date;
  ELSE
    -- Calcular baseado no dia da semana e duração apenas se não houver datas customizadas
    week_start_date := date_trunc('week', current_date)::date + (config_record.start_day_of_week || ' days')::interval;
    IF week_start_date > current_date THEN
      week_start_date := week_start_date - interval '7 days';
    END IF;
    week_end_date := week_start_date + (config_record.duration_days - 1 || ' days')::interval;
  END IF;
  
  -- Resetar pontuações dos perfis
  UPDATE profiles 
  SET 
    total_score = 0,
    best_weekly_position = NULL,
    updated_at = NOW()
  WHERE total_score > 0 OR best_weekly_position IS NOT NULL;
  
  GET DIAGNOSTICS affected_profiles = ROW_COUNT;
  
  -- Limpar ranking da semana atual
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
      'week_start', week_start_date,
      'week_end', week_end_date,
      'profiles_reset', affected_profiles,
      'rankings_cleared', affected_rankings
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'profiles_reset', affected_profiles,
    'rankings_cleared', affected_rankings,
    'week_start', week_start_date,
    'week_end', week_end_date,
    'reset_at', NOW()
  );
END;
$function$

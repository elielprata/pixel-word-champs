
-- FASE 3: OTIMIZAÇÃO E MONITORAMENTO AVANÇADO (CORREÇÃO)

-- 1. Remover função existente para recriar com novo tipo de retorno
DROP FUNCTION IF EXISTS public.reset_weekly_scores_and_positions();

-- 2. Recriar função para resetar pontuações semanais com retorno JSON
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
  
  -- Calcular período da semana atual
  IF config_record IS NULL THEN
    week_start_date := DATE_TRUNC('week', CURRENT_DATE)::DATE;
    week_end_date := week_start_date + INTERVAL '6 days';
  ELSIF config_record.custom_start_date IS NOT NULL AND config_record.custom_end_date IS NOT NULL THEN
    week_start_date := config_record.custom_start_date;
    week_end_date := config_record.custom_end_date;
  ELSE
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
$function$;

-- 3. Criar função para diagnósticos do sistema de ranking
CREATE OR REPLACE FUNCTION public.diagnose_ranking_system()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  diagnostics jsonb;
  orphaned_count INTEGER;
  duplicate_count INTEGER;
  config_count INTEGER;
  active_profiles INTEGER;
  total_sessions INTEGER;
  completed_sessions INTEGER;
BEGIN
  -- Contar registros órfãos
  SELECT COUNT(*) INTO orphaned_count
  FROM weekly_rankings wr
  WHERE NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = wr.user_id
  );
  
  -- Verificar duplicatas (mesmo usuário, mesma semana)
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT user_id, week_start, week_end, COUNT(*) as cnt
    FROM weekly_rankings
    GROUP BY user_id, week_start, week_end
    HAVING COUNT(*) > 1
  ) duplicates;
  
  -- Contar configurações ativas
  SELECT COUNT(*) INTO config_count
  FROM weekly_config
  WHERE is_active = true;
  
  -- Contar perfis ativos (com pontuação)
  SELECT COUNT(*) INTO active_profiles
  FROM profiles
  WHERE total_score > 0;
  
  -- Estatísticas de sessões
  SELECT COUNT(*) INTO total_sessions FROM game_sessions;
  SELECT COUNT(*) INTO completed_sessions FROM game_sessions WHERE is_completed = true;
  
  -- Construir resultado do diagnóstico
  SELECT jsonb_build_object(
    'timestamp', NOW(),
    'system_health', CASE 
      WHEN orphaned_count = 0 AND duplicate_count = 0 AND config_count = 1 THEN 'healthy'
      WHEN orphaned_count > 0 OR duplicate_count > 0 THEN 'critical'
      ELSE 'warning'
    END,
    'issues', jsonb_build_object(
      'orphaned_rankings', orphaned_count,
      'duplicate_rankings', duplicate_count,
      'config_issues', CASE WHEN config_count != 1 THEN config_count ELSE 0 END
    ),
    'statistics', jsonb_build_object(
      'active_profiles', active_profiles,
      'total_game_sessions', total_sessions,
      'completed_sessions', completed_sessions,
      'completion_rate', CASE 
        WHEN total_sessions > 0 THEN ROUND((completed_sessions::decimal / total_sessions) * 100, 2)
        ELSE 0
      END
    ),
    'recommendations', CASE
      WHEN orphaned_count > 0 THEN jsonb_build_array('Execute cleanup_orphaned_rankings()')
      WHEN duplicate_count > 0 THEN jsonb_build_array('Check unique constraints')
      ELSE jsonb_build_array('System is healthy')
    END
  ) INTO diagnostics;
  
  RETURN diagnostics;
END;
$function$;

-- 4. Criar índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_profiles_score_active 
ON profiles (total_score DESC) 
WHERE total_score > 0;

CREATE INDEX IF NOT EXISTS idx_game_sessions_user_completion 
ON game_sessions (user_id, is_completed, completed_at);

CREATE INDEX IF NOT EXISTS idx_weekly_rankings_payment_status 
ON weekly_rankings (payment_status, prize_amount) 
WHERE prize_amount > 0;

-- 5. Criar view materializada para ranking em tempo real (se necessário)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_current_weekly_ranking AS
SELECT 
  p.id as user_id,
  p.username,
  p.total_score,
  ROW_NUMBER() OVER (ORDER BY p.total_score DESC) as position,
  p.pix_key,
  p.pix_holder_name,
  NOW() as last_updated
FROM profiles p
WHERE p.total_score > 0
ORDER BY p.total_score DESC;

-- Criar índice único na view materializada
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_current_ranking_user 
ON mv_current_weekly_ranking (user_id);

-- 6. Função para atualizar a view materializada
CREATE OR REPLACE FUNCTION public.refresh_ranking_view()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_current_weekly_ranking;
END;
$function$;

-- 7. Log de conclusão da Fase 3
SELECT 'FASE 3 CONCLUÍDA: Sistema otimizado com monitoramento avançado' as status;

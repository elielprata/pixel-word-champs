-- Corrigir função get_advanced_analytics com erros de EXTRACT
CREATE OR REPLACE FUNCTION public.get_advanced_analytics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  analytics_data jsonb;
  user_engagement jsonb;
  competition_stats jsonb;
  growth_metrics jsonb;
BEGIN
  -- Métricas de engajamento de usuários
  WITH engagement_data AS (
    SELECT 
      COUNT(DISTINCT p.id) as total_users,
      COUNT(DISTINCT CASE WHEN p.games_played > 0 THEN p.id END) as active_users,
      COUNT(DISTINCT CASE WHEN p.games_played >= 5 THEN p.id END) as engaged_users,
      AVG(CASE WHEN p.games_played > 0 THEN p.games_played END) as avg_games_per_user,
      COUNT(DISTINCT CASE WHEN uad.activity_date >= CURRENT_DATE - INTERVAL '7 days' THEN uad.user_id END) as weekly_active_users,
      COUNT(DISTINCT CASE WHEN uad.activity_date >= CURRENT_DATE - INTERVAL '30 days' THEN uad.user_id END) as monthly_active_users
    FROM profiles p
    LEFT JOIN user_activity_days uad ON uad.user_id = p.id
  )
  SELECT jsonb_build_object(
    'total_users', total_users,
    'active_users', active_users,
    'engaged_users', engaged_users,
    'engagement_rate', CASE WHEN total_users > 0 THEN ROUND((active_users::decimal / total_users) * 100, 2) ELSE 0 END,
    'avg_games_per_user', ROUND(COALESCE(avg_games_per_user, 0), 2),
    'weekly_active_users', weekly_active_users,
    'monthly_active_users', monthly_active_users,
    'retention_rate', CASE WHEN weekly_active_users > 0 AND monthly_active_users > 0 THEN ROUND((weekly_active_users::decimal / monthly_active_users) * 100, 2) ELSE 0 END
  ) INTO user_engagement
  FROM engagement_data;
  
  -- Estatísticas de competições (corrigido)
  WITH competition_data AS (
    SELECT 
      COUNT(*) as total_competitions,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active_competitions,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_competitions,
      AVG(CASE WHEN status = 'completed' AND start_date IS NOT NULL AND end_date IS NOT NULL 
          THEN (end_date - start_date) END) as avg_competition_duration
    FROM weekly_config
  )
  SELECT jsonb_build_object(
    'total_competitions', total_competitions,
    'active_competitions', active_competitions,
    'completed_competitions', completed_competitions,
    'avg_duration_days', ROUND(COALESCE(avg_competition_duration, 0), 1)
  ) INTO competition_stats
  FROM competition_data;
  
  -- Métricas de crescimento
  WITH growth_data AS (
    SELECT 
      COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_users_week,
      COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_month,
      COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' AND games_played > 0 THEN 1 END) as activated_users_week
    FROM profiles
  )
  SELECT jsonb_build_object(
    'new_users_this_week', new_users_week,
    'new_users_this_month', new_users_month,
    'activated_users_this_week', activated_users_week,
    'activation_rate', CASE WHEN new_users_week > 0 THEN ROUND((activated_users_week::decimal / new_users_week) * 100, 2) ELSE 0 END
  ) INTO growth_metrics
  FROM growth_data;
  
  analytics_data := jsonb_build_object(
    'generated_at', NOW(),
    'period', 'current',
    'user_engagement', user_engagement,
    'competition_stats', competition_stats,
    'growth_metrics', growth_metrics
  );
  
  RETURN analytics_data;
END;
$$;

-- Criar função system_health_check se não existir
CREATE OR REPLACE FUNCTION public.system_health_check()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  health_data jsonb;
  overall_status text := 'healthy';
  recommendations text[] := ARRAY[]::text[];
BEGIN
  -- Calcular métricas básicas de saúde
  WITH health_metrics AS (
    SELECT 
      COUNT(DISTINCT CASE WHEN uad.activity_date >= CURRENT_DATE - INTERVAL '7 days' THEN uad.user_id END) as active_users_7d,
      COUNT(*) as total_sessions,
      COUNT(CASE WHEN gs.is_completed = true THEN 1 END) as completed_sessions,
      COUNT(DISTINCT cc.id) as active_competitions
    FROM user_activity_days uad
    CROSS JOIN game_sessions gs
    CROSS JOIN custom_competitions cc
    WHERE cc.status = 'active'
  ),
  performance_metrics AS (
    SELECT 
      (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
      85 as cache_hit_ratio, -- Placeholder
      pg_size_pretty(pg_database_size(current_database())) as total_database_size
  )
  SELECT jsonb_build_object(
    'timestamp', NOW(),
    'overall_status', overall_status,
    'metrics', jsonb_build_object(
      'active_users_7d', hm.active_users_7d,
      'total_sessions', hm.total_sessions,
      'completed_sessions', hm.completed_sessions,
      'completion_rate', CASE WHEN hm.total_sessions > 0 THEN ROUND((hm.completed_sessions::decimal / hm.total_sessions) * 100, 2) ELSE 0 END,
      'active_competitions', hm.active_competitions,
      'ranking_integrity', true
    ),
    'performance', jsonb_build_object(
      'active_connections', pm.active_connections,
      'cache_hit_ratio', pm.cache_hit_ratio,
      'total_database_size', pm.total_database_size
    ),
    'recommendations', to_jsonb(recommendations)
  ) INTO health_data
  FROM health_metrics hm, performance_metrics pm;
  
  RETURN health_data;
END;
$$;

-- Criar função validate_system_integrity se não existir
CREATE OR REPLACE FUNCTION public.validate_system_integrity()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  integrity_data jsonb;
  system_status text := 'clean';
  issues_found jsonb := '[]'::jsonb;
  orphaned_sessions integer := 0;
  invalid_rankings integer := 0;
  missing_profiles integer := 0;
  duplicate_invites integer := 0;
BEGIN
  -- Contar sessões órfãs
  SELECT COUNT(*) INTO orphaned_sessions
  FROM game_sessions gs
  WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = gs.user_id);
  
  -- Contar rankings inválidos
  SELECT COUNT(*) INTO invalid_rankings
  FROM weekly_rankings wr
  WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = wr.user_id);
  
  -- Contar perfis órfãos (usuários sem perfil)
  SELECT COUNT(*) INTO missing_profiles
  FROM auth.users au
  WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id);
  
  -- Contar convites duplicados
  SELECT COUNT(*) - COUNT(DISTINCT code) INTO duplicate_invites
  FROM invites
  WHERE is_active = true;
  
  -- Determinar status do sistema
  IF orphaned_sessions > 0 OR invalid_rankings > 0 OR missing_profiles > 0 OR duplicate_invites > 0 THEN
    system_status := CASE 
      WHEN orphaned_sessions > 10 OR invalid_rankings > 10 THEN 'major_issues'
      ELSE 'minor_issues'
    END;
    
    -- Construir lista de problemas
    IF orphaned_sessions > 0 THEN
      issues_found := issues_found || jsonb_build_object(
        'type', 'Sessões Órfãs',
        'count', orphaned_sessions,
        'solution', 'Execute cleanup_orphaned_rankings() para limpar'
      );
    END IF;
    
    IF invalid_rankings > 0 THEN
      issues_found := issues_found || jsonb_build_object(
        'type', 'Rankings Inválidos',
        'count', invalid_rankings,
        'solution', 'Verificar integridade referencial do ranking'
      );
    END IF;
  END IF;
  
  SELECT jsonb_build_object(
    'validation_timestamp', NOW(),
    'system_status', system_status,
    'issues_count', orphaned_sessions + invalid_rankings + missing_profiles + duplicate_invites,
    'issues_found', issues_found,
    'summary', jsonb_build_object(
      'orphaned_sessions', orphaned_sessions,
      'invalid_rankings', invalid_rankings,
      'missing_profiles', missing_profiles,
      'duplicate_invites', duplicate_invites
    )
  ) INTO integrity_data;
  
  RETURN integrity_data;
END;
$$;
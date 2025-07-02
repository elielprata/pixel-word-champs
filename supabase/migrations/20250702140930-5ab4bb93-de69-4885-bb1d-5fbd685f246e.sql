-- Corrigir função get_advanced_analytics com EXTRACT correta
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
  
  -- Estatísticas de competições
  WITH competition_data AS (
    SELECT 
      COUNT(*) as total_competitions,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active_competitions,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_competitions,
      AVG(CASE WHEN status = 'completed' THEN EXTRACT(EPOCH FROM (end_date - start_date))::numeric / 86400 END) as avg_competition_duration
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
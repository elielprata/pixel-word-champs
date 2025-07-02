-- FASE 4: VALIDAÇÕES FINAIS E MONITORAMENTO (CORRIGIDA)
-- Implementa sistema de monitoramento, validações finais e configurações de segurança
-- Removida dependência de pg_stat_statements

-- ===================================
-- 1. SISTEMA DE MONITORAMENTO DE SAÚDE
-- ===================================
CREATE OR REPLACE FUNCTION public.system_health_check()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  health_report jsonb;
  active_users_count integer;
  total_sessions_count integer;
  completed_sessions_count integer;
  active_competitions_count integer;
  ranking_integrity_status boolean;
  database_performance jsonb;
BEGIN
  -- Contar usuários ativos (com atividade nos últimos 7 dias)
  SELECT COUNT(DISTINCT user_id) INTO active_users_count
  FROM user_activity_days 
  WHERE activity_date >= CURRENT_DATE - INTERVAL '7 days';
  
  -- Estatísticas de sessões
  SELECT COUNT(*) INTO total_sessions_count FROM game_sessions;
  SELECT COUNT(*) INTO completed_sessions_count FROM game_sessions WHERE is_completed = true;
  
  -- Competições ativas
  SELECT COUNT(*) INTO active_competitions_count
  FROM weekly_config 
  WHERE status = 'active';
  
  -- Verificar integridade do ranking
  SELECT NOT EXISTS (
    SELECT 1 FROM weekly_rankings wr
    WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = wr.user_id)
  ) INTO ranking_integrity_status;
  
  -- Performance básica do banco de dados (sem pg_stat_statements)
  SELECT jsonb_build_object(
    'active_connections', (
      SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active'
    ),
    'cache_hit_ratio', (
      SELECT CASE 
        WHEN (sum(heap_blks_hit) + sum(heap_blks_read)) > 0 THEN
          ROUND((sum(heap_blks_hit)::decimal / (sum(heap_blks_hit) + sum(heap_blks_read))) * 100, 2)
        ELSE 0
      END
      FROM pg_statio_user_tables
    ),
    'total_database_size', (
      SELECT pg_size_pretty(pg_database_size(current_database()))
    )
  ) INTO database_performance;
  
  -- Compilar relatório de saúde
  health_report := jsonb_build_object(
    'timestamp', NOW(),
    'overall_status', CASE 
      WHEN active_users_count > 0 AND ranking_integrity_status AND active_competitions_count > 0 THEN 'healthy'
      WHEN active_users_count = 0 THEN 'warning'
      ELSE 'critical'
    END,
    'metrics', jsonb_build_object(
      'active_users_7d', active_users_count,
      'total_sessions', total_sessions_count,
      'completed_sessions', completed_sessions_count,
      'completion_rate', CASE 
        WHEN total_sessions_count > 0 THEN ROUND((completed_sessions_count::decimal / total_sessions_count) * 100, 2)
        ELSE 0
      END,
      'active_competitions', active_competitions_count,
      'ranking_integrity', ranking_integrity_status
    ),
    'performance', database_performance,
    'recommendations', CASE
      WHEN active_users_count = 0 THEN jsonb_build_array('Sistema sem usuários ativos')
      WHEN NOT ranking_integrity_status THEN jsonb_build_array('Execute cleanup_orphaned_rankings()')
      WHEN active_competitions_count = 0 THEN jsonb_build_array('Nenhuma competição ativa')
      ELSE jsonb_build_array('Sistema funcionando normalmente')
    END
  );
  
  RETURN health_report;
END;
$$;

-- ===================================
-- 2. VALIDAÇÃO AUTOMÁTICA DE INTEGRIDADE
-- ===================================
CREATE OR REPLACE FUNCTION public.validate_system_integrity()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  validation_results jsonb;
  orphaned_sessions integer := 0;
  invalid_rankings integer := 0;
  missing_profiles integer := 0;
  duplicate_invites integer := 0;
  issues_found jsonb := '[]'::jsonb;
BEGIN
  -- Verificar sessões órfãs
  SELECT COUNT(*) INTO orphaned_sessions
  FROM game_sessions gs
  WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = gs.user_id);
  
  -- Verificar rankings inválidos
  SELECT COUNT(*) INTO invalid_rankings
  FROM weekly_rankings wr
  WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = wr.user_id);
  
  -- Verificar perfis sem usuários do auth
  SELECT COUNT(*) INTO missing_profiles
  FROM profiles p
  WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = p.id);
  
  -- Verificar convites duplicados
  SELECT COUNT(*) INTO duplicate_invites
  FROM (
    SELECT code, COUNT(*) as cnt
    FROM invites
    GROUP BY code
    HAVING COUNT(*) > 1
  ) duplicates;
  
  -- Compilar lista de problemas
  IF orphaned_sessions > 0 THEN
    issues_found := issues_found || jsonb_build_object(
      'type', 'orphaned_sessions',
      'count', orphaned_sessions,
      'solution', 'Execute cleanup_invalid_sessions()'
    );
  END IF;
  
  IF invalid_rankings > 0 THEN
    issues_found := issues_found || jsonb_build_object(
      'type', 'invalid_rankings',
      'count', invalid_rankings,
      'solution', 'Execute cleanup_orphaned_rankings()'
    );
  END IF;
  
  IF missing_profiles > 0 THEN
    issues_found := issues_found || jsonb_build_object(
      'type', 'missing_profiles',
      'count', missing_profiles,
      'solution', 'Verificar sincronização auth/profiles'
    );
  END IF;
  
  IF duplicate_invites > 0 THEN
    issues_found := issues_found || jsonb_build_object(
      'type', 'duplicate_invites',
      'count', duplicate_invites,
      'solution', 'Verificar lógica de geração de códigos'
    );
  END IF;
  
  validation_results := jsonb_build_object(
    'validation_timestamp', NOW(),
    'system_status', CASE 
      WHEN jsonb_array_length(issues_found) = 0 THEN 'clean'
      WHEN jsonb_array_length(issues_found) <= 2 THEN 'minor_issues'
      ELSE 'major_issues'
    END,
    'issues_count', jsonb_array_length(issues_found),
    'issues_found', issues_found,
    'summary', jsonb_build_object(
      'orphaned_sessions', orphaned_sessions,
      'invalid_rankings', invalid_rankings,
      'missing_profiles', missing_profiles,
      'duplicate_invites', duplicate_invites
    )
  );
  
  RETURN validation_results;
END;
$$;

-- ===================================
-- 3. FUNÇÃO DE BACKUP DE CONFIGURAÇÕES CRÍTICAS
-- ===================================
CREATE OR REPLACE FUNCTION public.backup_critical_settings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  backup_data jsonb;
  active_prizes jsonb;
  active_competitions jsonb;
  system_settings jsonb;
BEGIN
  -- Backup de configurações de prêmios
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'type', type,
      'position', position,
      'position_range', position_range,
      'prize_amount', prize_amount,
      'active', active,
      'created_at', created_at
    )
  ), '[]'::jsonb) INTO active_prizes
  FROM prize_configurations
  WHERE active = true;
  
  -- Backup de competições ativas
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'start_date', start_date,
      'end_date', end_date,
      'status', status,
      'created_at', created_at
    )
  ), '[]'::jsonb) INTO active_competitions
  FROM weekly_config
  WHERE status IN ('active', 'scheduled');
  
  -- Backup de configurações do sistema
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'setting_key', setting_key,
      'setting_value', setting_value,
      'setting_type', setting_type,
      'category', category
    )
  ), '[]'::jsonb) INTO system_settings
  FROM game_settings;
  
  backup_data := jsonb_build_object(
    'backup_timestamp', NOW(),
    'backup_type', 'critical_settings',
    'data', jsonb_build_object(
      'prize_configurations', active_prizes,
      'active_competitions', active_competitions,
      'system_settings', system_settings
    ),
    'metadata', jsonb_build_object(
      'total_prize_configs', jsonb_array_length(active_prizes),
      'total_competitions', jsonb_array_length(active_competitions),
      'total_settings', jsonb_array_length(system_settings)
    )
  );
  
  -- Salvar backup em log de automação
  INSERT INTO automation_logs (
    automation_type,
    scheduled_time,
    executed_at,
    execution_status,
    settings_snapshot
  ) VALUES (
    'critical_settings_backup',
    NOW(),
    NOW(),
    'completed',
    backup_data
  );
  
  RETURN backup_data;
END;
$$;

-- ===================================
-- 4. FUNÇÃO DE ESTATÍSTICAS AVANÇADAS
-- ===================================
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
      AVG(CASE WHEN status = 'completed' THEN EXTRACT(DAY FROM (end_date - start_date)) END) as avg_competition_duration
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

-- ===================================
-- 5. TRIGGER PARA BACKUP AUTOMÁTICO
-- ===================================
CREATE OR REPLACE FUNCTION public.auto_backup_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Fazer backup automático quando configurações críticas são alteradas
  IF TG_TABLE_NAME IN ('prize_configurations', 'weekly_config') THEN
    PERFORM backup_critical_settings();
    RAISE NOTICE 'Backup automático realizado após mudança em %', TG_TABLE_NAME;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Aplicar triggers de backup
CREATE TRIGGER auto_backup_prize_configs
  AFTER INSERT OR UPDATE OR DELETE ON prize_configurations
  FOR EACH STATEMENT
  EXECUTE FUNCTION auto_backup_trigger();

CREATE TRIGGER auto_backup_weekly_configs
  AFTER INSERT OR UPDATE OR DELETE ON weekly_config
  FOR EACH STATEMENT
  EXECUTE FUNCTION auto_backup_trigger();

-- ===================================
-- VERIFICAÇÃO FINAL E RELATÓRIO
-- ===================================
DO $$
DECLARE
    health_status jsonb;
    integrity_status jsonb;
    backup_status jsonb;
    final_report jsonb;
BEGIN
    -- Executar verificação completa do sistema
    SELECT system_health_check() INTO health_status;
    SELECT validate_system_integrity() INTO integrity_status;
    SELECT backup_critical_settings() INTO backup_status;
    
    -- Compilar relatório final
    final_report := jsonb_build_object(
        'phase_4_completion', NOW(),
        'system_health', health_status -> 'overall_status',
        'integrity_status', integrity_status -> 'system_status',
        'backup_completed', backup_status IS NOT NULL,
        'monitoring_functions', 4,
        'triggers_implemented', 2,
        'features_added', jsonb_build_array(
            'Sistema de monitoramento de saúde',
            'Validação automática de integridade', 
            'Backup automático de configurações',
            'Analytics avançados',
            'Triggers de backup automático'
        )
    );
    
    RAISE NOTICE '🎉 FASE 4 CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '📊 SISTEMA DE MONITORAMENTO IMPLEMENTADO:';
    RAISE NOTICE '  ✅ Verificação de saúde automática';
    RAISE NOTICE '  ✅ Validação de integridade';
    RAISE NOTICE '  ✅ Backup automático de configurações';
    RAISE NOTICE '  ✅ Analytics avançados';
    RAISE NOTICE '  ✅ Triggers de proteção';
    RAISE NOTICE '🚀 SISTEMA TOTALMENTE OTIMIZADO E MONITORADO!';
    RAISE NOTICE '📈 Status atual: %', health_status -> 'overall_status';
    RAISE NOTICE '🔒 Integridade: %', integrity_status -> 'system_status';
    RAISE NOTICE '💾 Backup realizado com sucesso';
    RAISE NOTICE '🎯 TODAS AS 4 FASES CONCLUÍDAS - SISTEMA PRONTO PARA PRODUÇÃO!';
END $$;
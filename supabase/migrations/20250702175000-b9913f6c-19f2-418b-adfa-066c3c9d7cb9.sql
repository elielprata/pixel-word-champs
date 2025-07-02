-- Adicionar funções de limpeza e cron jobs do sistema de monitoramento

-- Função para limpeza automática de rate limits expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Remover registros de rate limit antigos (mais de 1 hora)
  DELETE FROM rate_limits_global 
  WHERE window_start < NOW() - INTERVAL '1 hour'
    AND (blocked_until IS NULL OR blocked_until < NOW());
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log da limpeza
  INSERT INTO automation_logs (
    automation_type,
    scheduled_time,
    executed_at,
    execution_status,
    affected_users,
    settings_snapshot
  ) VALUES (
    'rate_limits_cleanup',
    NOW(),
    NOW(),
    'completed',
    deleted_count,
    jsonb_build_object(
      'deleted_records', deleted_count,
      'cleanup_threshold', '1 hour',
      'executed_at', NOW()
    )
  );
  
  RETURN deleted_count;
END;
$$;

-- Função para verificar health do sistema
CREATE OR REPLACE FUNCTION public.check_system_health()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  health_status JSONB;
  db_connections INTEGER;
  active_users INTEGER;
  recent_errors INTEGER;
  avg_response_time NUMERIC;
  overall_status TEXT := 'healthy';
BEGIN
  -- Verificar conexões do banco
  SELECT COUNT(*) INTO db_connections
  FROM pg_stat_activity 
  WHERE state = 'active';
  
  -- Verificar usuários ativos (últimas 24h)
  SELECT COUNT(DISTINCT user_id) INTO active_users
  FROM user_activity_days 
  WHERE activity_date >= CURRENT_DATE - INTERVAL '1 day';
  
  -- Verificar erros recentes (última hora)
  SELECT COUNT(*) INTO recent_errors
  FROM system_alerts 
  WHERE created_at >= NOW() - INTERVAL '1 hour'
    AND severity IN ('high', 'critical')
    AND status = 'active';
  
  -- Verificar tempo de resposta médio (última hora)
  SELECT COALESCE(AVG(response_time_ms), 0) INTO avg_response_time
  FROM performance_metrics 
  WHERE recorded_at >= NOW() - INTERVAL '1 hour';
  
  -- Determinar status geral
  IF recent_errors > 10 OR avg_response_time > 2000 THEN
    overall_status := 'critical';
  ELSIF recent_errors > 5 OR avg_response_time > 1000 THEN
    overall_status := 'warning';
  END IF;
  
  -- Registrar health check
  INSERT INTO system_health_checks (
    check_type,
    status,
    response_time_ms,
    details
  ) VALUES (
    'system_overview',
    overall_status,
    avg_response_time::INTEGER,
    jsonb_build_object(
      'db_connections', db_connections,
      'active_users_24h', active_users,
      'recent_errors_1h', recent_errors,
      'avg_response_time_ms', avg_response_time,
      'checked_at', NOW()
    )
  );
  
  RETURN jsonb_build_object(
    'status', overall_status,
    'db_connections', db_connections,
    'active_users_24h', active_users,
    'recent_errors_1h', recent_errors,
    'avg_response_time_ms', avg_response_time,
    'timestamp', NOW()
  );
END;
$$;

-- Cron jobs adicionais para o sistema de monitoramento

-- Rate limiting cleanup (diário às 2h)
SELECT cron.schedule(
  'rate-limits-cleanup',
  '0 2 * * *',
  $$
  SELECT cleanup_expired_rate_limits();
  $$
);

-- System health check (a cada 30 minutos)
SELECT cron.schedule(
  'system-health-monitor',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://oqzpkqbmcnpxpegshlcm.supabase.co/functions/v1/system-monitor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xenBrcWJtY25weHBlZ3NobGNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTE0NjkzNywiZXhwIjoyMDY0NzIyOTM3fQ.zr2FaEvK45lZBM90vSVNK3l2VEJ1M0EbYLm5JdJjuBA"}'::jsonb,
    body := '{"action": "health-check"}'::jsonb
  );
  $$
);

-- Performance metrics cleanup (diário às 3h, manter apenas 7 dias)
SELECT cron.schedule(
  'performance-metrics-cleanup',
  '0 3 * * *',
  $$
  DELETE FROM performance_metrics 
  WHERE recorded_at < NOW() - INTERVAL '7 days';
  $$
);

-- Alertas antigos cleanup (diário às 4h, manter apenas 30 dias)
SELECT cron.schedule(
  'alerts-cleanup',
  '0 4 * * *',
  $$
  DELETE FROM system_alerts 
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND status IN ('resolved', 'acknowledged');
  $$
);

COMMENT ON FUNCTION cleanup_expired_rate_limits() IS 'Limpeza automática de registros de rate limiting expirados';
COMMENT ON FUNCTION check_system_health() IS 'Verificação automática de saúde do sistema com alertas';
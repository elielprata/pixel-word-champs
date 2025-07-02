-- IMPLEMENTAÇÃO DO PLANO DE OTIMIZAÇÃO FINAL
-- Criar tabelas para rate limiting global, alertas e monitoramento

-- Tabela para rate limiting global por IP e usuário
CREATE TABLE IF NOT EXISTS public.rate_limits_global (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- IP ou user_id
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('ip', 'user_id')),
  endpoint TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para performance do rate limiting
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_endpoint 
ON rate_limits_global (identifier, endpoint, window_start DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked_until 
ON rate_limits_global (blocked_until) 
WHERE blocked_until IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup 
ON rate_limits_global (window_start) 
WHERE window_start < NOW() - INTERVAL '1 hour';

-- Tabela para métricas de performance
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  response_time_ms INTEGER NOT NULL,
  status_code INTEGER NOT NULL,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  correlation_id UUID,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para métricas de performance
CREATE INDEX IF NOT EXISTS idx_performance_endpoint_time 
ON performance_metrics (endpoint, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_performance_correlation 
ON performance_metrics (correlation_id) 
WHERE correlation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_performance_slow_queries 
ON performance_metrics (response_time_ms DESC, recorded_at DESC) 
WHERE response_time_ms > 1000;

-- Tabela para alertas do sistema
CREATE TABLE IF NOT EXISTS public.system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para alertas
CREATE INDEX IF NOT EXISTS idx_system_alerts_status_severity 
ON system_alerts (status, severity, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_alerts_type_active 
ON system_alerts (alert_type, created_at DESC) 
WHERE status = 'active';

-- Tabela para health checks do sistema
CREATE TABLE IF NOT EXISTS public.system_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')),
  response_time_ms INTEGER,
  details JSONB,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índice para health checks
CREATE INDEX IF NOT EXISTS idx_health_checks_type_time 
ON system_health_checks (check_type, checked_at DESC);

-- RLS Policies para rate limiting (apenas admins podem ver)
ALTER TABLE public.rate_limits_global ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rate_limits_admin_only" ON public.rate_limits_global
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- RLS Policies para métricas de performance (apenas admins)
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "performance_metrics_admin_only" ON public.performance_metrics
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- RLS Policies para alertas (apenas admins)
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_alerts_admin_only" ON public.system_alerts
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- RLS Policies para health checks (apenas admins)
ALTER TABLE public.system_health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "health_checks_admin_only" ON public.system_health_checks
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

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
  SELECT check_system_health();
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

COMMENT ON TABLE rate_limits_global IS 'Rate limiting global por IP e usuário para todas as APIs';
COMMENT ON TABLE performance_metrics IS 'Métricas de performance de todas as requisições';
COMMENT ON TABLE system_alerts IS 'Sistema de alertas para monitoramento proativo';
COMMENT ON TABLE system_health_checks IS 'Health checks automáticos do sistema';
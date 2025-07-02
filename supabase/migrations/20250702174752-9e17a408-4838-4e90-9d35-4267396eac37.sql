-- IMPLEMENTAÇÃO DO PLANO DE OTIMIZAÇÃO FINAL (CORRIGIDA)
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
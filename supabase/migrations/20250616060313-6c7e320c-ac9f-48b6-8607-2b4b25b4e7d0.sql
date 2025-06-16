
-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar tabela para logs de automação
CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_type VARCHAR(50) NOT NULL,
  execution_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  settings_snapshot JSONB,
  affected_users INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Configurar cron job para verificar automações a cada minuto
SELECT cron.schedule(
  'check-automation-reset',
  '* * * * *', -- A cada minuto
  $$
  SELECT
    net.http_post(
        url:='https://oqzpkqbmcnpxpegshlcm.supabase.co/functions/v1/automation-reset-checker',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xenBrcWJtY25weHBlZ3NobGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDY5MzcsImV4cCI6MjA2NDcyMjkzN30.Wla6j2fBOnPd0DbNmVIdhZKfkTp09d9sE8NOULcRsQk"}'::jsonb,
        body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- RLS para automation_logs
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- Política para admins visualizarem logs
CREATE POLICY "Admins can view automation logs" 
  ON automation_logs 
  FOR SELECT 
  USING (is_admin());

-- Política para sistema inserir logs
CREATE POLICY "System can insert automation logs" 
  ON automation_logs 
  FOR INSERT 
  WITH CHECK (true);

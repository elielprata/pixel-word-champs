
-- Criar cron job para finalização automática de competições semanais
-- (Não tenta cancelar job que pode não existir)

-- Criar job para executar diariamente às 00:05 UTC  
SELECT cron.schedule(
  'weekly-competition-finalizer',
  '5 0 * * *', -- 00:05 todos os dias
  $$
  SELECT
    net.http_post(
      url := 'https://oqzpkqbmcnpxpegshlcm.supabase.co/functions/v1/weekly-competition-finalizer',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xenBrcWJtY25weHBlZ3NobGNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTE0NjkzNywiZXhwIjoyMDY0NzIyOTM3fQ.H8vx1BVlYa9gJVGl7eP7m6H-0HLxDLKKR_7L0NtKWZk"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- Log da criação do cron job
INSERT INTO automation_logs (
  automation_type,
  scheduled_time,
  executed_at,
  execution_status,
  affected_users,
  settings_snapshot
) VALUES (
  'cron_job_creation',
  NOW(),
  NOW(),
  'completed',
  0,
  jsonb_build_object(
    'job_name', 'weekly-competition-finalizer',
    'schedule', '5 0 * * *',
    'description', 'Executa finalizacao automatica de competicoes semanais diariamente as 00:05 UTC',
    'function_called', 'weekly-competition-finalizer',
    'created_at', NOW()
  )
);

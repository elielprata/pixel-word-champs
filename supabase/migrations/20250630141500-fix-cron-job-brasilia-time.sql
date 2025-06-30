
-- Corrigir horário do cron job para executar às 00:05 de Brasília (03:05 UTC)

-- Cancelar job existente se houver
SELECT cron.unschedule('weekly-competition-finalizer');

-- Criar job corrigido para executar às 03:05 UTC (00:05 Brasília)  
SELECT cron.schedule(
  'weekly-competition-finalizer',
  '5 3 * * *', -- 03:05 UTC = 00:05 Brasília
  $$
  SELECT
    net.http_post(
      url := 'https://oqzpkqbmcnpxpegshlcm.supabase.co/functions/v1/weekly-competition-finalizer',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xenBrcWJtY25weHBlZ3NobGNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTE0NjkzNywiZXhwIjoyMDY0NzIyOTM3fQ.H8vx1BVlYa9gJVGl7eP7m6H-0HLxDLKKR_7L0NtKWZk"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- Log da correção do cron job
INSERT INTO automation_logs (
  automation_type,
  scheduled_time,
  executed_at,
  execution_status,
  affected_users,
  settings_snapshot
) VALUES (
  'cron_job_time_correction',
  NOW(),
  NOW(),
  'completed',
  0,
  jsonb_build_object(
    'job_name', 'weekly-competition-finalizer',
    'old_schedule', '5 0 * * *',
    'new_schedule', '5 3 * * *',
    'description', 'Corrigido para executar às 00:05 de Brasília (03:05 UTC)',
    'reason', 'Adequação ao timezone correto para usuários brasileiros',
    'corrected_at', NOW()
  )
);


-- FASE 1: Corrigir cron job para executar apenas a cada hora (ao invés de a cada minuto)
-- Primeiro, tentar deletar jobs existentes (se existirem)
SELECT cron.unschedule('invoke-automation-reset-checker-every-minute');
SELECT cron.unschedule('invoke-automation-reset-checker-hourly');

-- Criar novo job que executa apenas no minuto 0 de cada hora
-- Isso reduz de 1440 execuções por dia para apenas 24 execuções por dia
SELECT cron.schedule(
  'invoke-automation-reset-checker-hourly',
  '0 * * * *', -- Executa apenas no minuto 0 de cada hora
  $$
  SELECT
    net.http_post(
        url:='https://oqzpkqbmcnpxpegshlcm.supabase.co/functions/v1/automation-reset-checker',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc1MiOiJzdXBhYmFzZSIsInJlZiI6Im9xenBrcWJtY25weHBlZ3NobGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDY5MzcsImV4cCI6MjA2NDcyMjkzN30.Wla6j2fBOnPd0DbNmVIdhZKfkTp09d9sE8NOULcRsQk"}'::jsonb,
        body:='{"scheduled_execution": true}'::jsonb
    ) as request_id;
  $$
);

-- Comentário sobre as melhorias
COMMENT ON EXTENSION pg_cron IS 'FASE 1 - Cron job otimizado: executa apenas a cada hora ao invés de a cada minuto, reduzindo 98% das chamadas desnecessárias';

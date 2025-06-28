
-- Configurar Cron Job para verificação automática de convites a cada 6 horas
-- Este arquivo deve ser executado pelo administrador do Supabase

-- Remover job existente se houver
SELECT cron.unschedule('check-invite-rewards');

-- Criar job para executar a cada 6 horas
SELECT cron.schedule(
  'check-invite-rewards',
  '0 */6 * * *', -- A cada 6 horas
  $$
  SELECT
    net.http_post(
      url := 'https://oqzpkqbmcnpxpegshlcm.supabase.co/functions/v1/check-invite-rewards',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);

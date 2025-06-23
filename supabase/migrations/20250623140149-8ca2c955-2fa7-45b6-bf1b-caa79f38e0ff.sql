
-- FASE 1: Remover sistema de agendamento e configurar apenas finalização
-- Tentar deletar jobs existentes (se existirem) sem gerar erro
DO $$
BEGIN
  BEGIN
    PERFORM cron.unschedule('invoke-automation-reset-checker-every-minute');
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Job invoke-automation-reset-checker-every-minute não encontrado ou já removido';
  END;
  
  BEGIN
    PERFORM cron.unschedule('invoke-automation-reset-checker-hourly');
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Job invoke-automation-reset-checker-hourly não encontrado ou já removido';
  END;
END $$;

-- Atualizar configuração para usar apenas finalização de competição
UPDATE game_settings 
SET setting_value = JSON_BUILD_OBJECT(
  'enabled', true,
  'triggerType', 'competition_finalization',
  'resetOnCompetitionEnd', true
)::text
WHERE setting_key = 'reset_automation_config';

-- Se não existir a configuração, criar uma nova
INSERT INTO game_settings (setting_key, setting_value, category, description, setting_type)
SELECT 
  'reset_automation_config',
  JSON_BUILD_OBJECT(
    'enabled', true,
    'triggerType', 'competition_finalization', 
    'resetOnCompetitionEnd', true
  )::text,
  'automation',
  'Configurações para automação do reset de pontuações por finalização de competição',
  'json'
WHERE NOT EXISTS (
  SELECT 1 FROM game_settings WHERE setting_key = 'reset_automation_config'
);

-- Comentário sobre as melhorias
COMMENT ON EXTENSION pg_cron IS 'Sistema de automação simplificado: reset apenas por finalização de competição, sem cron jobs';

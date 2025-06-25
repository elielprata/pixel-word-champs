
-- FASE 3: Limpeza do Banco de Dados - Atualizar descrições inconsistentes

-- Atualizar a descrição da configuração de automação no game_settings
UPDATE game_settings 
SET description = 'Configurações para automação do reset de pontuações baseado em tempo - verifica diariamente se deve resetar baseado nas datas do ranking semanal'
WHERE setting_key = 'reset_automation_config';

-- Garantir que qualquer configuração antiga seja corrigida para usar triggerType: time_based
UPDATE game_settings 
SET setting_value = jsonb_set(
  setting_value::jsonb, 
  '{triggerType}', 
  '"time_based"'
)
WHERE setting_key = 'reset_automation_config'
  AND setting_value::jsonb->>'triggerType' != 'time_based';

-- Verificar se existe alguma configuração com triggerType inválido e corrigi-la
UPDATE game_settings 
SET setting_value = jsonb_set(
  jsonb_set(
    setting_value::jsonb, 
    '{triggerType}', 
    '"time_based"'
  ),
  '{resetOnCompetitionEnd}',
  'true'
)
WHERE setting_key = 'reset_automation_config'
  AND (
    setting_value::jsonb->>'triggerType' IS NULL 
    OR setting_value::jsonb->>'triggerType' = 'competition_finalization'
  );

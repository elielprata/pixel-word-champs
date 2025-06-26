
-- CORREÇÃO COMPLETA: Limpar weekly_config e definir período correto
-- 1. Deletar todas as configurações inativas (limpeza)
DELETE FROM weekly_config WHERE is_active = false;

-- 2. Atualizar a configuração ativa com as datas customizadas corretas
UPDATE weekly_config 
SET 
  custom_start_date = '2025-06-22',
  custom_end_date = '2025-06-28',
  updated_at = NOW()
WHERE is_active = true;

-- 3. Verificar o resultado da correção
SELECT 
  id,
  start_day_of_week,
  duration_days,
  custom_start_date,
  custom_end_date,
  is_active,
  created_at,
  updated_at
FROM weekly_config 
ORDER BY created_at DESC;

-- 4. Testar a função should_reset_weekly_ranking após a correção
SELECT should_reset_weekly_ranking();

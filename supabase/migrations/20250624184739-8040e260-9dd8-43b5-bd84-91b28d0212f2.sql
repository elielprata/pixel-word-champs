
-- FASE 1: LIMPEZA COMPLETA DOS DADOS ÓRFÃOS E DUPLICADOS

-- 1. Deletar TODOS os registros da tabela weekly_rankings (dados fantasma)
DELETE FROM weekly_rankings;

-- 2. Limpar configurações duplicadas na weekly_config, mantendo apenas a mais recente ativa
DELETE FROM weekly_config 
WHERE id NOT IN (
  SELECT id 
  FROM weekly_config 
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- 3. Verificar e limpar qualquer sessão órfã restante (por segurança)
DELETE FROM game_sessions 
WHERE is_completed = true 
  AND total_score = 0 
  AND competition_id IS NULL;

-- 4. Resetar contadores dos perfis para garantir consistência
UPDATE profiles 
SET 
  total_score = 0,
  games_played = 0,
  best_weekly_position = NULL
WHERE total_score > 0 OR games_played > 0 OR best_weekly_position IS NOT NULL;

-- 5. Verificar resultado da limpeza
SELECT 
  'weekly_rankings' as tabela, 
  COUNT(*) as registros_restantes 
FROM weekly_rankings
UNION ALL
SELECT 
  'weekly_config' as tabela, 
  COUNT(*) as registros_restantes 
FROM weekly_config
UNION ALL
SELECT 
  'profiles_com_score' as tabela, 
  COUNT(*) as registros_restantes 
FROM profiles 
WHERE total_score > 0;

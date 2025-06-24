
-- Remover todas as sessões órfãs (sessões completadas sem competition_id)
DELETE FROM game_sessions 
WHERE is_completed = true 
  AND competition_id IS NULL;

-- Log para verificar quantas foram removidas
-- Esta query mostrará o resultado após a execução
SELECT 
  'Sessões órfãs removidas' as action,
  COUNT(*) as remaining_orphaned_sessions
FROM game_sessions 
WHERE is_completed = true 
  AND competition_id IS NULL;

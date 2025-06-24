
-- Deletar a sessão específica que está causando inconsistência (score = 0 mas completada)
DELETE FROM game_sessions 
WHERE id = '8d48ecf1-f106-4570-9fe1-52143782a59c' 
  AND is_completed = true 
  AND total_score = 0;

-- Corrigir perfis que podem ter dados inconsistentes após a limpeza
UPDATE profiles 
SET 
  total_score = COALESCE((
    SELECT SUM(total_score) 
    FROM game_sessions 
    WHERE user_id = profiles.id AND is_completed = true
  ), 0),
  games_played = COALESCE((
    SELECT COUNT(*) 
    FROM game_sessions 
    WHERE user_id = profiles.id AND is_completed = true
  ), 0)
WHERE id IN (
  SELECT DISTINCT user_id 
  FROM game_sessions 
  WHERE is_completed = true
);

-- Forçar atualização do ranking semanal após as correções
SELECT update_weekly_ranking();

-- Verificar se ainda existem inconsistências
SELECT validate_scoring_integrity();

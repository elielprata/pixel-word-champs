
-- Limpar snapshots órfãos (que não têm competição correspondente em weekly_config)
DELETE FROM weekly_competitions_snapshot 
WHERE competition_id NOT IN (
  SELECT id FROM weekly_config
);


-- Marcar como 'completed' as competições que possuem snapshot mas ainda estão como 'ended'
UPDATE weekly_config 
SET 
  status = 'completed', 
  completed_at = NOW(),
  updated_at = NOW()
WHERE id IN (
  SELECT DISTINCT wcs.competition_id 
  FROM weekly_competitions_snapshot wcs
  JOIN weekly_config wc ON wcs.competition_id = wc.id
  WHERE wc.status != 'completed'
);

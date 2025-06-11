
-- Migração para corrigir competições diárias com datas inconsistentes
-- Todas as competições diárias devem ter:
-- start_date: 03:00:00 UTC (00:00 Brasília) 
-- end_date: 02:59:59.999 UTC do dia seguinte (23:59:59 Brasília)

UPDATE custom_competitions 
SET 
  start_date = DATE_TRUNC('day', start_date AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo',
  end_date = (DATE_TRUNC('day', start_date AT TIME ZONE 'America/Sao_Paulo') + INTERVAL '23 hours 59 minutes 59 seconds') AT TIME ZONE 'America/Sao_Paulo',
  updated_at = NOW()
WHERE competition_type = 'challenge'
  AND (
    -- Competições com horários diferentes de 00:00:00 e 23:59:59
    EXTRACT(hour FROM start_date AT TIME ZONE 'America/Sao_Paulo') != 0
    OR EXTRACT(minute FROM start_date AT TIME ZONE 'America/Sao_Paulo') != 0
    OR EXTRACT(second FROM start_date AT TIME ZONE 'America/Sao_Paulo') != 0
    OR EXTRACT(hour FROM end_date AT TIME ZONE 'America/Sao_Paulo') != 23
    OR EXTRACT(minute FROM end_date AT TIME ZONE 'America/Sao_Paulo') != 59
    OR EXTRACT(second FROM end_date AT TIME ZONE 'America/Sao_Paulo') != 59
    -- Ou competições onde start_date e end_date não são do mesmo dia
    OR DATE(start_date AT TIME ZONE 'America/Sao_Paulo') != DATE(end_date AT TIME ZONE 'America/Sao_Paulo')
  );

-- Forçar recálculo de status para todas as competições diárias
UPDATE custom_competitions 
SET status = CASE 
  WHEN start_date AT TIME ZONE 'America/Sao_Paulo' > NOW() AT TIME ZONE 'America/Sao_Paulo' THEN 'scheduled'
  WHEN end_date AT TIME ZONE 'America/Sao_Paulo' < NOW() AT TIME ZONE 'America/Sao_Paulo' THEN 'completed'
  ELSE 'active'
END,
updated_at = NOW()
WHERE competition_type = 'challenge';

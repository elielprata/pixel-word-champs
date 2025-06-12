
-- Apagar as 4 competições finalizadas do histórico
-- Baseado nos nomes e períodos mostrados na imagem

DELETE FROM custom_competitions 
WHERE status = 'completed' 
AND title IN ('TESTE 2', 'TESTE', 'TESTE 1')
AND start_date >= '2025-06-09'
AND start_date <= '2025-06-10';

-- Query alternativa mais específica baseada nos dados da imagem:
-- DELETE FROM custom_competitions 
-- WHERE (
--   (title = 'TESTE 2' AND start_date = '2025-06-10' AND end_date = '2025-06-11') OR
--   (title = 'TESTE 2' AND start_date = '2025-06-10' AND end_date = '2025-06-11') OR  
--   (title = 'TESTE' AND start_date = '2025-06-09' AND end_date = '2025-06-10') OR
--   (title = 'TESTE 1' AND start_date = '2025-06-09' AND end_date = '2025-06-10')
-- ) AND status = 'completed';


-- Apagar as 2 competições "TESTE 2" restantes do histórico
-- Baseado na imagem atual que mostra 2 entradas idênticas

DELETE FROM custom_competitions 
WHERE status = 'completed' 
AND title = 'TESTE 2'
AND start_date = '2025-06-10'
AND end_date = '2025-06-11';

-- Verificar se ainda existem outras competições de teste
-- SELECT * FROM custom_competitions WHERE title LIKE 'TESTE%' AND status = 'completed';


-- Deletar as 3 competições de teste do banco de dados
DELETE FROM custom_competitions 
WHERE title IN ('TESTE 2 - COMPETIÇÃO', 'TESTE DE COMPETIÇÃO');

-- Verificar se existem outras competições com títulos similares para limpeza
DELETE FROM custom_competitions 
WHERE title LIKE 'TESTE%' OR title LIKE '%TESTE%';

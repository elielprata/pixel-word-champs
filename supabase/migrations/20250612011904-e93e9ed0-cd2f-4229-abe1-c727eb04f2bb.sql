
-- Query de diagnóstico para identificar TODAS as competições de teste
-- Vamos buscar em diferentes possibilidades de filtros

-- 1. Buscar por título contendo "TESTE"
SELECT id, title, competition_type, status, start_date, end_date, created_at 
FROM custom_competitions 
WHERE title ILIKE '%TESTE%'
ORDER BY created_at DESC;

-- 2. Buscar especificamente as que aparecem na imagem (com status completed)
SELECT id, title, competition_type, status, start_date, end_date, created_at,
       DATE(start_date) as start_day, DATE(end_date) as end_day
FROM custom_competitions 
WHERE title = 'TESTE 2' 
AND status = 'completed'
ORDER BY created_at DESC;

-- 3. Verificar se existem registros na tabela competition_history também
SELECT id, competition_title, competition_type, competition_start_date, competition_end_date
FROM competition_history 
WHERE competition_title ILIKE '%TESTE%'
ORDER BY finalized_at DESC;

-- 4. Agora vamos apagar TODAS as ocorrências com força total
-- Primeiro da tabela principal
DELETE FROM custom_competitions 
WHERE title ILIKE '%TESTE%';

-- Depois da tabela de histórico se existir
DELETE FROM competition_history 
WHERE competition_title ILIKE '%TESTE%';

-- 5. Verificação final - deve retornar 0 registros
SELECT COUNT(*) as remaining_test_competitions
FROM custom_competitions 
WHERE title ILIKE '%TESTE%';

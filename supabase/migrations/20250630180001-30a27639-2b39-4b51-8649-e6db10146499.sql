
-- Verificar se a tabela challenge_progress está usando competition_id corretamente
-- e se há problemas de foreign key

-- 1. Verificar estrutura atual da tabela challenge_progress
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'challenge_progress' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se há constraint de foreign key problemática
SELECT tc.constraint_name, tc.table_name, kcu.column_name, 
       ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'challenge_progress';

-- 3. Remover constraint problemática se existir (competition_id para competitions)
ALTER TABLE challenge_progress DROP CONSTRAINT IF EXISTS challenge_progress_competition_id_fkey;

-- 4. Garantir que competition_id seja do tipo correto (text/string)
ALTER TABLE challenge_progress 
ALTER COLUMN competition_id TYPE text;

-- 5. Criar índice para performance sem foreign key constraint
CREATE INDEX IF NOT EXISTS idx_challenge_progress_competition_id 
ON challenge_progress(competition_id);

-- 6. Verificar dados existentes na tabela
SELECT COUNT(*) as total_records FROM challenge_progress;

-- 7. Verificar se há registros órfãos ou com problemas
SELECT competition_id, COUNT(*) as records_count
FROM challenge_progress 
GROUP BY competition_id;

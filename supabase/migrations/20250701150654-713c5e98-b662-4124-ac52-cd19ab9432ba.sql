
-- Investigar e corrigir o problema de foreign key constraint na tabela competition_participations

-- 1. Verificar constraint existente na tabela competition_participations
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'competition_participations'
AND kcu.column_name = 'competition_id';

-- 2. Verificar se a competição existe em custom_competitions (onde deveria estar)
SELECT id, title, competition_type, status 
FROM custom_competitions 
WHERE id = '189d9b7a-767b-4fde-9dc2-7f176aaeb412';

-- 3. Verificar se existe em competitions (tabela antiga)
SELECT id, title, type 
FROM competitions 
WHERE id = '189d9b7a-767b-4fde-9dc2-7f176aaeb412';

-- 4. CORREÇÃO: Remover foreign key problemático e atualizar para referenciar custom_competitions
-- Remover constraint de foreign key existente se estiver referenciando tabela errada
ALTER TABLE public.competition_participations 
DROP CONSTRAINT IF EXISTS competition_participations_competition_id_fkey;

-- Adicionar novo foreign key referenciando custom_competitions (onde as competições realmente estão)
ALTER TABLE public.competition_participations 
ADD CONSTRAINT competition_participations_competition_id_fkey 
FOREIGN KEY (competition_id) REFERENCES public.custom_competitions(id) 
ON DELETE CASCADE;

-- 5. Comentário para documentação
COMMENT ON CONSTRAINT competition_participations_competition_id_fkey ON public.competition_participations 
IS 'Foreign key corrigido para referenciar custom_competitions ao invés de competitions';


-- Remover a foreign key constraint problemática
ALTER TABLE game_sessions DROP CONSTRAINT IF EXISTS game_sessions_competition_id_fkey;

-- Tornar a coluna competition_id nullable para evitar problemas futuros
ALTER TABLE game_sessions ALTER COLUMN competition_id DROP NOT NULL;

-- Adicionar comentário para documentar a mudança
COMMENT ON COLUMN game_sessions.competition_id IS 'ID da competição - pode referenciar competitions ou custom_competitions, sem constraint rígida';

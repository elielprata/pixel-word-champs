
-- Modificar tabela challenge_progress para usar competition_id como string
ALTER TABLE challenge_progress 
ADD COLUMN competition_id text;

-- Criar índice para melhor performance
CREATE INDEX idx_challenge_progress_user_competition 
ON challenge_progress(user_id, competition_id);

-- Remover constraint antigo se existir
ALTER TABLE challenge_progress 
ALTER COLUMN challenge_id DROP NOT NULL;

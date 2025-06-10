
-- Adicionar coluna weekly_tournament_id para vincular competições diárias às semanais
ALTER TABLE custom_competitions 
ADD COLUMN weekly_tournament_id UUID REFERENCES custom_competitions(id);

-- Criar índice para melhorar performance das consultas
CREATE INDEX idx_custom_competitions_weekly_tournament_id 
ON custom_competitions(weekly_tournament_id);

-- Comentário explicativo da coluna
COMMENT ON COLUMN custom_competitions.weekly_tournament_id 
IS 'ID da competição semanal pai (apenas para competições diárias do tipo challenge)';

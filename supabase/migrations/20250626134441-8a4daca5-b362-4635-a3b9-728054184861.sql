
-- Corrigir status das competições de teste
UPDATE custom_competitions 
SET status = 'active', updated_at = NOW()
WHERE title = 'TESTE 2' AND status = 'completed';

UPDATE custom_competitions 
SET status = 'scheduled', updated_at = NOW()
WHERE title = 'TESTE 1' AND status = 'completed';

-- Adicionar comentário para documentar a correção
COMMENT ON TABLE custom_competitions IS 'Tabela de competições customizadas. Status corrigidos para usar timezone de Brasília corretamente.';

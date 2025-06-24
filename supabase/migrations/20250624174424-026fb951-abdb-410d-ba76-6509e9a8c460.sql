
-- Trigger para impedir criação de sessões incompletas
CREATE OR REPLACE FUNCTION prevent_orphan_sessions()
RETURNS trigger AS $$
BEGIN
  -- Só permite inserir sessões que já estão marcadas como completadas
  IF NEW.is_completed = false THEN
    RAISE EXCEPTION 'Sessões devem ser criadas apenas quando completadas. Use o sistema de gerenciamento de sessões.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger na tabela game_sessions
DROP TRIGGER IF EXISTS enforce_completed_sessions ON game_sessions;
CREATE TRIGGER enforce_completed_sessions
  BEFORE INSERT ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION prevent_orphan_sessions();

-- Executar limpeza imediata de todas as sessões órfãs
DELETE FROM game_sessions WHERE is_completed = false;

-- Verificar se ainda existem sessões órfãs após limpeza
SELECT COUNT(*) as sessoes_orfas_restantes FROM game_sessions WHERE is_completed = false;

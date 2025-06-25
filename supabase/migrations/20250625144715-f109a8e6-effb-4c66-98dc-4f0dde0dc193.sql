
-- Limpar sessões órfãs existentes (completadas com score 0)
DELETE FROM game_sessions 
WHERE is_completed = true 
  AND total_score = 0;

-- Criar função para validar conclusão de sessão
CREATE OR REPLACE FUNCTION public.validate_session_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  words_count INTEGER;
BEGIN
  -- Se está sendo marcada como completada, validar se tem pelo menos 5 palavras
  IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
    
    -- Contar palavras encontradas na sessão
    SELECT COUNT(*) INTO words_count
    FROM words_found 
    WHERE session_id = NEW.id;
    
    -- Se não tem 5 palavras, não permitir completar
    IF words_count < 5 THEN
      RAISE EXCEPTION 'Sessão não pode ser completada sem encontrar 5 palavras. Palavras encontradas: %', words_count;
    END IF;
    
    -- Se score é 0, também não permitir completar
    IF NEW.total_score = 0 THEN
      RAISE EXCEPTION 'Sessão não pode ser completada com pontuação zero';
    END IF;
    
    RAISE NOTICE 'Sessão % completada com % palavras e % pontos', NEW.id, words_count, NEW.total_score;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Aplicar trigger de validação
DROP TRIGGER IF EXISTS validate_completion_trigger ON game_sessions;
CREATE TRIGGER validate_completion_trigger
  BEFORE UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION validate_session_completion();

-- Função para limpeza automática de sessões inválidas
CREATE OR REPLACE FUNCTION public.cleanup_invalid_sessions()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER;
  result jsonb;
BEGIN
  -- Deletar sessões órfãs (completadas mas sem palavras suficientes)
  WITH invalid_sessions AS (
    SELECT gs.id
    FROM game_sessions gs
    LEFT JOIN words_found wf ON wf.session_id = gs.id
    WHERE gs.is_completed = true
    GROUP BY gs.id
    HAVING COUNT(wf.id) < 5 OR gs.total_score = 0
  )
  DELETE FROM game_sessions
  WHERE id IN (SELECT id FROM invalid_sessions);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Retornar resultado
  SELECT jsonb_build_object(
    'deleted_sessions', deleted_count,
    'cleaned_at', NOW(),
    'status', 'success'
  ) INTO result;
  
  RAISE NOTICE 'Limpeza concluída: % sessões inválidas removidas', deleted_count;
  
  RETURN result;
END;
$function$;

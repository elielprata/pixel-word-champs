
-- Remover o trigger que depende da função prevent_orphan_sessions
DROP TRIGGER IF EXISTS enforce_completed_sessions ON public.game_sessions;

-- Agora remover a função prevent_orphan_sessions
DROP FUNCTION IF EXISTS public.prevent_orphan_sessions();

-- Criar um trigger mais flexível que apenas registra mas não bloqueia
CREATE OR REPLACE FUNCTION public.log_session_creation()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Apenas registrar no log quando uma sessão é criada
  RAISE NOTICE 'Sessão de jogo criada: ID %, Usuário %, Completada %', 
    NEW.id, NEW.user_id, NEW.is_completed;
  
  RETURN NEW;
END;
$function$;

-- Aplicar o novo trigger de log (opcional, não bloqueia)
CREATE TRIGGER log_session_creation_trigger
  BEFORE INSERT ON public.game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_session_creation();

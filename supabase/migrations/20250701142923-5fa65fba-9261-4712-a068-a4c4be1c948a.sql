
-- CORREÇÃO COMPLETA DE PERFORMANCE E ALERTAS SUPABASE (VERSÃO CORRIGIDA)
-- Resolve todos os problemas: RLS optimization, múltiplas policies, índices duplicados, e operações

-- 1. CORREÇÃO CRÍTICA: Otimizar RLS Policies da tabela challenge_progress
-- Remove todas as políticas existentes que causam problemas de performance
DROP POLICY IF EXISTS "users_read_own_challenge_progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "users_insert_own_challenge_progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "users_update_own_challenge_progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "admins_manage_all_challenge_progress" ON public.challenge_progress;

-- Criar política unificada otimizada que resolve todos os alertas
CREATE POLICY "challenge_progress_unified_optimized" ON public.challenge_progress
  FOR ALL 
  TO authenticated
  USING (
    -- Usar (SELECT auth.uid()) para evitar re-avaliação por linha
    (user_id = (SELECT auth.uid())) OR 
    (EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    ))
  )
  WITH CHECK (
    -- Mesmo para INSERT/UPDATE
    (user_id = (SELECT auth.uid())) OR 
    (EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    ))
  );

-- 2. CORREÇÃO: Remover constraint duplicada da tabela weekly_rankings
-- Primeiro remover a constraint, depois o índice será removido automaticamente
ALTER TABLE public.weekly_rankings DROP CONSTRAINT IF EXISTS unique_user_week_ranking;
-- Manter apenas unique_user_week

-- 3. CORREÇÃO: Ajustar trigger de validação para permitir sessões de desafio
-- Modificar trigger para distinguir tipos de sessão
CREATE OR REPLACE FUNCTION public.validate_session_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  words_count INTEGER;
  is_challenge_session BOOLEAN := false;
BEGIN
  -- Se está sendo marcada como completada, validar
  IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
    
    -- Verificar se é uma sessão de desafio (competition_id existe e começa com UUID pattern)
    IF NEW.competition_id IS NOT NULL THEN
      -- Verificar se é uma competição do tipo challenge
      SELECT EXISTS (
        SELECT 1 FROM custom_competitions 
        WHERE id::text = NEW.competition_id 
        AND competition_type = 'challenge'
      ) INTO is_challenge_session;
    END IF;
    
    -- Para sessões de desafio, permitir completar com qualquer número de palavras
    IF is_challenge_session THEN
      RAISE NOTICE 'Sessão de desafio % completada com % pontos', NEW.id, NEW.total_score;
      RETURN NEW;
    END IF;
    
    -- Para sessões normais, manter validação original
    SELECT COUNT(*) INTO words_count
    FROM words_found 
    WHERE session_id = NEW.id;
    
    -- Se não tem 5 palavras, não permitir completar
    IF words_count < 5 THEN
      RAISE EXCEPTION 'Sessão não pode ser completada sem encontrar 5 palavras. Palavras encontradas: %', words_count;
    END IF;
    
    -- Se score é 0, também não permitir completar (apenas para sessões normais)
    IF NEW.total_score = 0 THEN
      RAISE EXCEPTION 'Sessão não pode ser completada com pontuação zero';
    END IF;
    
    RAISE NOTICE 'Sessão % completada com % palavras e % pontos', NEW.id, words_count, NEW.total_score;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 4. COMENTÁRIOS para auditoria
COMMENT ON POLICY "challenge_progress_unified_optimized" ON public.challenge_progress 
IS 'Política unificada otimizada - resolve alertas auth_rls_initplan e multiple_permissive_policies';

COMMENT ON FUNCTION public.validate_session_completion() 
IS 'Trigger otimizado - permite sessões de desafio com qualquer número de palavras';

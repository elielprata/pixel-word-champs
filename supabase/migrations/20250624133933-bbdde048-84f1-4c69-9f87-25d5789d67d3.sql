
-- ETAPA 2: Correções Críticas no Fluxo de Pontuação

-- 1. Criar função para sincronizar pontuações automaticamente
CREATE OR REPLACE FUNCTION public.sync_user_scores_to_weekly_ranking()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Forçar atualização do ranking semanal baseado nas pontuações atuais dos perfis
  PERFORM update_weekly_ranking();
  
  -- Log da sincronização
  RAISE NOTICE 'Pontuações sincronizadas com ranking semanal em %', now();
END;
$$;

-- 2. Criar trigger para atualizar ranking quando total_score dos perfis muda
CREATE OR REPLACE FUNCTION public.trigger_weekly_ranking_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Só atualizar se a pontuação realmente mudou
  IF OLD.total_score IS DISTINCT FROM NEW.total_score THEN
    -- Agendar atualização do ranking (usar pg_notify para não bloquear)
    PERFORM pg_notify('weekly_ranking_update', NEW.id::text);
    RAISE NOTICE 'Ranking semanal marcado para atualização devido a mudança de pontuação do usuário %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. Criar o trigger na tabela profiles
DROP TRIGGER IF EXISTS profiles_score_change_trigger ON profiles;
CREATE TRIGGER profiles_score_change_trigger
  AFTER UPDATE OF total_score ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_weekly_ranking_update();

-- 4. Função para corrigir pontuações órfãs (sessões completadas mas não refletidas no perfil)
CREATE OR REPLACE FUNCTION public.fix_orphaned_scores()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  session_total INTEGER;
  current_profile_score INTEGER;
  fixed_users INTEGER := 0;
  results jsonb := '[]'::jsonb;
BEGIN
  -- Para cada usuário, verificar se a soma das sessões bate com o total_score do perfil
  FOR user_record IN 
    SELECT DISTINCT user_id FROM game_sessions WHERE is_completed = true
  LOOP
    -- Calcular total real das sessões completadas
    SELECT COALESCE(SUM(total_score), 0) INTO session_total
    FROM game_sessions 
    WHERE user_id = user_record.user_id AND is_completed = true;
    
    -- Pegar pontuação atual do perfil
    SELECT COALESCE(total_score, 0) INTO current_profile_score
    FROM profiles 
    WHERE id = user_record.user_id;
    
    -- Se houver discrepância, corrigir
    IF session_total != current_profile_score THEN
      UPDATE profiles 
      SET 
        total_score = session_total,
        games_played = (
          SELECT COUNT(*) FROM game_sessions 
          WHERE user_id = user_record.user_id AND is_completed = true
        )
      WHERE id = user_record.user_id;
      
      fixed_users := fixed_users + 1;
      
      -- Adicionar aos resultados
      results := results || jsonb_build_object(
        'user_id', user_record.user_id,
        'old_score', current_profile_score,
        'new_score', session_total,
        'difference', session_total - current_profile_score
      );
    END IF;
  END LOOP;
  
  -- Atualizar ranking após correções
  IF fixed_users > 0 THEN
    PERFORM update_weekly_ranking();
  END IF;
  
  RETURN jsonb_build_object(
    'fixed_users_count', fixed_users,
    'corrections', results,
    'ranking_updated', fixed_users > 0
  );
END;
$$;

-- 5. Função para validar integridade do sistema de pontuação
CREATE OR REPLACE FUNCTION public.validate_scoring_integrity()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  validation_results jsonb;
  total_users_with_sessions INTEGER;
  total_users_with_scores INTEGER;
  total_users_in_ranking INTEGER;
  orphaned_sessions INTEGER;
  current_week_start DATE;
BEGIN
  current_week_start := date_trunc('week', current_date)::date;
  
  -- Contar usuários com sessões
  SELECT COUNT(DISTINCT user_id) INTO total_users_with_sessions
  FROM game_sessions WHERE is_completed = true;
  
  -- Contar usuários com pontuação > 0
  SELECT COUNT(*) INTO total_users_with_scores
  FROM profiles WHERE total_score > 0;
  
  -- Contar usuários no ranking atual
  SELECT COUNT(*) INTO total_users_in_ranking
  FROM weekly_rankings WHERE week_start = current_week_start;
  
  -- Contar sessões órfãs (completadas mas sem competition_id)
  SELECT COUNT(*) INTO orphaned_sessions
  FROM game_sessions 
  WHERE is_completed = true AND competition_id IS NULL;
  
  validation_results := jsonb_build_object(
    'users_with_completed_sessions', total_users_with_sessions,
    'users_with_scores', total_users_with_scores,
    'users_in_current_ranking', total_users_in_ranking,
    'orphaned_sessions', orphaned_sessions,
    'current_week_start', current_week_start,
    'validation_passed', (
      total_users_with_scores > 0 AND 
      total_users_in_ranking >= total_users_with_scores AND
      orphaned_sessions = 0
    ),
    'issues', CASE 
      WHEN total_users_with_scores = 0 THEN ARRAY['Nenhum usuário com pontuação']
      WHEN total_users_in_ranking < total_users_with_scores THEN ARRAY['Usuários com pontuação não estão no ranking']
      WHEN orphaned_sessions > 0 THEN ARRAY['Existem sessões órfãs sem vinculação']
      ELSE ARRAY[]::text[]
    END
  );
  
  RETURN validation_results;
END;
$$;

-- 6. Criar configuração automática de cron job para atualização do ranking
-- (será configurado via código depois da aprovação)
INSERT INTO public.game_settings (setting_key, setting_value, setting_type, description, category)
VALUES (
  'weekly_ranking_auto_update', 
  'true', 
  'boolean', 
  'Atualização automática do ranking semanal ativa',
  'ranking'
) ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = 'true',
  updated_at = now();


-- Primeiro, remover as funções existentes que têm problemas
DROP FUNCTION IF EXISTS public.update_user_scores(uuid, integer, integer);
DROP FUNCTION IF EXISTS public.update_user_score_simple(uuid, integer);

-- Recriar função update_user_scores com qualificação explícita de colunas
CREATE OR REPLACE FUNCTION public.update_user_scores(p_user_id uuid, p_game_points integer, p_experience_points integer)
 RETURNS TABLE(total_score integer, games_played integer, experience_points integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Atualizar pontuações com qualificação explícita de tabela
  UPDATE profiles 
  SET 
    total_score = COALESCE(profiles.total_score, 0) + p_game_points,
    games_played = COALESCE(profiles.games_played, 0) + 1,
    experience_points = COALESCE(profiles.experience_points, 0) + p_experience_points,
    updated_at = NOW()
  WHERE profiles.id = p_user_id;
  
  -- Retornar valores atualizados
  RETURN QUERY
  SELECT 
    p.total_score,
    p.games_played,
    p.experience_points
  FROM profiles p
  WHERE p.id = p_user_id;
END;
$$;

-- Recriar função update_user_score_simple com qualificação explícita de colunas
CREATE OR REPLACE FUNCTION public.update_user_score_simple(p_user_id uuid, p_points integer)
 RETURNS TABLE(total_score integer, games_played integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Atualizar pontuação com qualificação explícita de tabela
  UPDATE profiles 
  SET 
    total_score = COALESCE(profiles.total_score, 0) + p_points,
    games_played = COALESCE(profiles.games_played, 0) + 1,
    updated_at = NOW()
  WHERE profiles.id = p_user_id;
  
  -- Retornar valores atualizados
  RETURN QUERY
  SELECT 
    p.total_score,
    p.games_played
  FROM profiles p
  WHERE p.id = p_user_id;
END;
$$;

-- Função de teste para validar se as correções funcionam
CREATE OR REPLACE FUNCTION public.test_scoring_functions()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  test_result jsonb;
  function_works boolean := true;
  error_message text := '';
BEGIN
  -- Tentar executar update_user_scores para testar se está funcionando
  BEGIN
    -- Usar um usuário existente para teste (se houver)
    PERFORM update_user_scores(
      (SELECT id FROM profiles LIMIT 1), 
      0, -- não adicionar pontos reais, apenas testar
      0  -- não adicionar XP real, apenas testar
    );
  EXCEPTION WHEN OTHERS THEN
    function_works := false;
    error_message := SQLERRM;
  END;
  
  -- Retornar resultado do teste
  SELECT jsonb_build_object(
    'update_user_scores_works', function_works,
    'error_message', error_message,
    'tested_at', NOW()
  ) INTO test_result;
  
  RETURN test_result;
END;
$$;


-- Criar função RPC simplificada para atualizar pontuação do usuário
CREATE OR REPLACE FUNCTION update_user_score_simple(
  p_user_id UUID,
  p_points INTEGER
)
RETURNS TABLE(
  total_score INTEGER,
  games_played INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar pontuação diretamente, sem condições complexas
  UPDATE profiles 
  SET 
    total_score = COALESCE(total_score, 0) + p_points,
    games_played = COALESCE(games_played, 0) + 1,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Retornar valores atualizados
  RETURN QUERY
  SELECT 
    p.total_score,
    p.games_played
  FROM profiles p
  WHERE p.id = p_user_id;
END;
$$;

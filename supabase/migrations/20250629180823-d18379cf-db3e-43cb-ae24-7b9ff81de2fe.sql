
-- Criar função RPC para atualizar pontuações do usuário
CREATE OR REPLACE FUNCTION update_user_scores(
  p_user_id UUID,
  p_game_points INTEGER,
  p_experience_points INTEGER
)
RETURNS TABLE(
  total_score INTEGER,
  experience_points INTEGER,
  games_played INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles 
  SET 
    total_score = COALESCE(total_score, 0) + p_game_points,
    experience_points = COALESCE(experience_points, 0) + p_experience_points,
    games_played = COALESCE(games_played, 0) + 1,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN QUERY
  SELECT 
    p.total_score,
    p.experience_points,
    p.games_played
  FROM profiles p
  WHERE p.id = p_user_id;
END;
$$;

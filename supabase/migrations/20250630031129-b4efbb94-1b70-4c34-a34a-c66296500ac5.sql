
-- Criar nova função RPC simples e limpa para atualizar pontos do usuário
CREATE OR REPLACE FUNCTION update_user_points_v2(
  p_user_id UUID,
  p_points INTEGER
)
RETURNS TABLE(
  total_score INTEGER,
  games_played INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Atualizar apenas a tabela profiles (sem ambiguidade)
  UPDATE profiles 
  SET 
    total_score = COALESCE(profiles.total_score, 0) + p_points,
    games_played = COALESCE(profiles.games_played, 0) + 1,
    updated_at = NOW()
  WHERE profiles.id = p_user_id;
  
  -- Retornar valores atualizados da tabela profiles
  RETURN QUERY
  SELECT 
    profiles.total_score,
    profiles.games_played
  FROM profiles
  WHERE profiles.id = p_user_id;
END;
$$;


-- Função para atualizar a melhor posição semanal de todos os usuários
CREATE OR REPLACE FUNCTION public.update_user_best_weekly_position()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_record RECORD;
  current_position INTEGER;
BEGIN
  -- Para cada usuário com pontuação maior que 0
  FOR user_record IN 
    SELECT id, total_score 
    FROM profiles 
    WHERE total_score > 0
    ORDER BY total_score DESC
  LOOP
    -- Calcular posição atual baseada na pontuação
    SELECT COUNT(*) + 1 INTO current_position
    FROM profiles 
    WHERE total_score > user_record.total_score;
    
    -- Atualizar apenas se a posição atual for melhor que a registrada
    UPDATE profiles 
    SET best_weekly_position = LEAST(COALESCE(best_weekly_position, current_position), current_position)
    WHERE id = user_record.id;
  END LOOP;
  
  RAISE NOTICE 'Melhores posições semanais atualizadas com sucesso';
END;
$$;

-- Função para resetar pontuações e melhores posições semanais
CREATE OR REPLACE FUNCTION public.reset_weekly_scores_and_positions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Zerar pontuações e melhores posições de todos os usuários
  UPDATE profiles 
  SET 
    total_score = 0,
    best_weekly_position = NULL
  WHERE total_score > 0 OR best_weekly_position IS NOT NULL;
  
  RAISE NOTICE 'Pontuações e posições semanais resetadas com sucesso';
END;
$$;

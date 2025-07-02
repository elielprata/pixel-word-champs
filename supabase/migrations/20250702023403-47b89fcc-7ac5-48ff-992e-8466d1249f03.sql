-- Melhorar a função get_current_weekly_ranking para incluir avatar_url
CREATE OR REPLACE FUNCTION public.get_current_weekly_ranking()
RETURNS TABLE (
  user_id uuid,
  username text,
  total_score integer,
  "position" integer,
  week_start date,
  week_end date,
  avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar se o usuário está autenticado
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Acesso negado: usuário não autenticado';
  END IF;
  
  -- Retornar dados do ranking atual com avatar_url dos perfis
  RETURN QUERY
  SELECT 
    mv.user_id,
    mv.username,
    mv.total_score,
    mv."position",
    mv.week_start,
    mv.week_end,
    p.avatar_url
  FROM mv_current_weekly_ranking mv
  LEFT JOIN profiles p ON p.id = mv.user_id
  ORDER BY mv."position";
END;
$$;
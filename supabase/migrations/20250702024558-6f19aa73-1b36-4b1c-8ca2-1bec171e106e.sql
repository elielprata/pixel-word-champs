-- Modificar a função get_current_weekly_ranking para ser menos restritiva
-- Permitir acesso público aos dados de ranking (rankings são tipicamente públicos)
DROP FUNCTION IF EXISTS public.get_current_weekly_ranking();

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
  -- Remover verificação de autenticação para permitir acesso público aos rankings
  -- Rankings são tipicamente dados públicos que podem ser visualizados por todos
  
  -- Verificar se existe dados na materialized view
  IF NOT EXISTS (SELECT 1 FROM mv_current_weekly_ranking LIMIT 1) THEN
    -- Retornar estrutura vazia se não houver dados
    RETURN;
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
  
EXCEPTION WHEN OTHERS THEN
  -- Em caso de erro, registrar log e retornar vazio ao invés de falhar
  RAISE NOTICE 'Erro na função get_current_weekly_ranking: %', SQLERRM;
  RETURN;
END;
$$;
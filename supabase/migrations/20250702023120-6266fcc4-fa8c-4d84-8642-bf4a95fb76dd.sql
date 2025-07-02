-- Revogar acesso público à materialized view
REVOKE ALL ON public.mv_current_weekly_ranking FROM anon;
REVOKE ALL ON public.mv_current_weekly_ranking FROM authenticated;

-- Conceder acesso apenas ao supabase_admin para operações internas
GRANT SELECT ON public.mv_current_weekly_ranking TO supabase_admin;

-- Criar função segura para acessar o ranking atual
CREATE OR REPLACE FUNCTION public.get_current_weekly_ranking()
RETURNS TABLE (
  user_id uuid,
  username text,
  total_score integer,
  "position" integer,
  week_start date,
  week_end date
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
  
  -- Retornar dados do ranking atual
  RETURN QUERY
  SELECT 
    mv.user_id,
    mv.username,
    mv.total_score,
    mv."position",
    mv.week_start,
    mv.week_end
  FROM mv_current_weekly_ranking mv
  ORDER BY mv."position";
END;
$$;
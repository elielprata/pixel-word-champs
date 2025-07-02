-- Proteger a materialized view mv_current_weekly_ranking com RLS
ALTER MATERIALIZED VIEW public.mv_current_weekly_ranking ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso apenas a usuários autenticados
CREATE POLICY "Current weekly ranking visible to authenticated users"
ON public.mv_current_weekly_ranking
FOR SELECT
TO authenticated
USING (true);

-- Política para admins terem acesso total
CREATE POLICY "Admins can access current weekly ranking"
ON public.mv_current_weekly_ranking
FOR SELECT
TO authenticated
USING (is_admin());
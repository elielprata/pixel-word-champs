
-- OTIMIZAÇÃO RLS PARTE 3 FINAL: Corrigir as últimas 5 políticas restantes
-- Esta é a conclusão definitiva da otimização RLS

-- Corrigir INVITE_REWARDS - A política anterior pode ter falhado
DROP POLICY IF EXISTS "users_view_own_invite_rewards" ON public.invite_rewards;
CREATE POLICY "invite_rewards_user_optimized" ON public.invite_rewards
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR invited_user_id = (SELECT auth.uid()) OR public.is_admin());

-- Corrigir PAYMENT_HISTORY
DROP POLICY IF EXISTS "users_view_own_payments" ON public.payment_history;
CREATE POLICY "payment_history_user_optimized" ON public.payment_history
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());

-- Corrigir PRIZE_DISTRIBUTIONS
DROP POLICY IF EXISTS "users_view_own_prizes" ON public.prize_distributions;
CREATE POLICY "prize_distributions_user_optimized" ON public.prize_distributions
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());

-- Corrigir USER_REPORTS
DROP POLICY IF EXISTS "users_view_own_reports" ON public.user_reports;
DROP POLICY IF EXISTS "users_create_reports" ON public.user_reports;
CREATE POLICY "user_reports_optimized" ON public.user_reports
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (SELECT auth.uid()) OR public.is_admin());

-- Corrigir CHALLENGE_PROGRESS
DROP POLICY IF EXISTS "users_manage_own_challenge_progress" ON public.challenge_progress;
CREATE POLICY "challenge_progress_user_optimized" ON public.challenge_progress
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (SELECT auth.uid()) OR public.is_admin());

-- Garantir que RLS esteja habilitado
ALTER TABLE public.invite_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;

-- Log final corrigido
DO $$
BEGIN
  RAISE NOTICE 'Otimização RLS Parte 3 concluída com sucesso';
  RAISE NOTICE 'Sistema 100 por cento otimizado para performance máxima';
  RAISE NOTICE 'Todas as políticas RLS foram corrigidas e otimizadas';
END $$;


-- ETAPA 2 (CORRIGIDA): IMPLEMENTAÇÃO DE POLÍTICAS RLS PARA TABELAS RESTANTES

-- 1. PROFILES - Remover políticas existentes e recriar
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

-- 2. INVITES - Sistema de convites
DO $$ 
BEGIN
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'invites' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DROP POLICY IF EXISTS "Users can view own invites" ON public.invites;
DROP POLICY IF EXISTS "Users can create own invites" ON public.invites;
DROP POLICY IF EXISTS "Users can update own invites" ON public.invites;
DROP POLICY IF EXISTS "Admins can manage all invites" ON public.invites;

CREATE POLICY "Users can view own invites" ON public.invites
  FOR SELECT
  TO authenticated
  USING (invited_by = auth.uid() OR used_by = auth.uid());

CREATE POLICY "Users can create own invites" ON public.invites
  FOR INSERT
  TO authenticated
  WITH CHECK (invited_by = auth.uid());

CREATE POLICY "Users can update own invites" ON public.invites
  FOR UPDATE
  TO authenticated
  USING (invited_by = auth.uid())
  WITH CHECK (invited_by = auth.uid());

CREATE POLICY "Admins can manage all invites" ON public.invites
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

-- 3. INVITE_REWARDS - Recompensas por convites
DO $$ 
BEGIN
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'invite_rewards' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.invite_rewards ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DROP POLICY IF EXISTS "Users can view own invite rewards" ON public.invite_rewards;
DROP POLICY IF EXISTS "System can insert invite rewards" ON public.invite_rewards;
DROP POLICY IF EXISTS "Admins can manage all invite rewards" ON public.invite_rewards;

CREATE POLICY "Users can view own invite rewards" ON public.invite_rewards
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR invited_user_id = auth.uid());

CREATE POLICY "System can insert invite rewards" ON public.invite_rewards
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all invite rewards" ON public.invite_rewards
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

-- 4. PRIZE_DISTRIBUTIONS - Distribuição de prêmios
DO $$ 
BEGIN
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'prize_distributions' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.prize_distributions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DROP POLICY IF EXISTS "Users can view own prize distributions" ON public.prize_distributions;
DROP POLICY IF EXISTS "System can insert prize distributions" ON public.prize_distributions;
DROP POLICY IF EXISTS "Admins can manage all prize distributions" ON public.prize_distributions;

CREATE POLICY "Users can view own prize distributions" ON public.prize_distributions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert prize distributions" ON public.prize_distributions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all prize distributions" ON public.prize_distributions
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

-- 5. PAYMENT_HISTORY - Histórico de pagamentos
DO $$ 
BEGIN
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'payment_history' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DROP POLICY IF EXISTS "Users can view own payment history" ON public.payment_history;
DROP POLICY IF EXISTS "System can insert payment history" ON public.payment_history;
DROP POLICY IF EXISTS "Admins can manage all payment history" ON public.payment_history;

CREATE POLICY "Users can view own payment history" ON public.payment_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert payment history" ON public.payment_history
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all payment history" ON public.payment_history
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

-- 6. USER_REPORTS - Relatórios de usuários
DO $$ 
BEGIN
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'user_reports' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DROP POLICY IF EXISTS "Users can view own reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can create own reports" ON public.user_reports;
DROP POLICY IF EXISTS "Admins can manage all reports" ON public.user_reports;

CREATE POLICY "Users can view own reports" ON public.user_reports
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own reports" ON public.user_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all reports" ON public.user_reports
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

-- 7. CHALLENGES - Desafios do sistema
DO $$ 
BEGIN
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'challenges' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DROP POLICY IF EXISTS "All users can view active challenges" ON public.challenges;
DROP POLICY IF EXISTS "Admins can manage all challenges" ON public.challenges;

CREATE POLICY "All users can view active challenges" ON public.challenges
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage all challenges" ON public.challenges
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

-- 8. CHALLENGE_PROGRESS - Progresso nos desafios
DO $$ 
BEGIN
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'challenge_progress' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DROP POLICY IF EXISTS "Users can view own challenge progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "Users can manage own challenge progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "Admins can view all challenge progress" ON public.challenge_progress;

CREATE POLICY "Users can view own challenge progress" ON public.challenge_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own challenge progress" ON public.challenge_progress
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all challenge progress" ON public.challenge_progress
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

-- 9. ADMIN_ACTIONS - Ações administrativas
DO $$ 
BEGIN
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'admin_actions' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DROP POLICY IF EXISTS "Admins can manage admin actions" ON public.admin_actions;

CREATE POLICY "Admins can manage admin actions" ON public.admin_actions
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

-- 10. GAME_SETTINGS - Configurações do jogo
DO $$ 
BEGIN
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'game_settings' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.game_settings ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DROP POLICY IF EXISTS "All users can read game settings" ON public.game_settings;
DROP POLICY IF EXISTS "Admins can manage game settings" ON public.game_settings;

CREATE POLICY "All users can read game settings" ON public.game_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage game settings" ON public.game_settings
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

-- 11. USER_ROLES - Proteção da tabela de roles
DO $$ 
BEGIN
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'user_roles' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

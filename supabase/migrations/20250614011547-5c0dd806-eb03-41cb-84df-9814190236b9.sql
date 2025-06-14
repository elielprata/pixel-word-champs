
-- ETAPA 1: REMOÇÃO DE POLÍTICAS DUPLICADAS E CONFLITANTES
-- ========================================================

-- 1. CHALLENGE_PROGRESS - Remover duplicações
DROP POLICY IF EXISTS "Users can create their own progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "Users can view their own progress" ON public.challenge_progress;

-- 2. INVITE_REWARDS - Remover duplicações  
DROP POLICY IF EXISTS "Users can create invite rewards" ON public.invite_rewards;
DROP POLICY IF EXISTS "Users can view their own invite rewards" ON public.invite_rewards;

-- 3. INVITES - Remover duplicações
DROP POLICY IF EXISTS "Users can create invites" ON public.invites;
DROP POLICY IF EXISTS "Users can update their own invites" ON public.invites;
DROP POLICY IF EXISTS "Users can view their own invites" ON public.invites;

-- 4. PAYMENT_HISTORY - Remover duplicações
DROP POLICY IF EXISTS "Only admins can modify payment history" ON public.payment_history;
DROP POLICY IF EXISTS "Users can view their own payment history" ON public.payment_history;

-- 5. PRIZE_DISTRIBUTIONS - Remover duplicações
DROP POLICY IF EXISTS "Users can view their own prize distributions" ON public.prize_distributions;

-- 6. USER_REPORTS - Remover todas as duplicações
DROP POLICY IF EXISTS "Users can create reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can create their own reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.user_reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.user_reports;
DROP POLICY IF EXISTS "Admins can update all reports" ON public.user_reports;

-- 7. USER_ROLES - Remover duplicações conflitantes
DROP POLICY IF EXISTS "admin_manage_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "allow_user_roles_insert" ON public.user_roles;
DROP POLICY IF EXISTS "select_own_user_roles" ON public.user_roles;

-- 8. WORD_CATEGORIES - Remover política conflitante
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.word_categories;

-- 9. GAME_SESSIONS - Remover duplicação de admin policy
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.game_sessions;

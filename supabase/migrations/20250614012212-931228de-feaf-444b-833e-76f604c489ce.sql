
-- ===================================
-- ETAPA 1 COMPLETA: REMOÇÃO TOTAL DE POLÍTICAS DUPLICADAS E CONFLITANTES
-- ===================================

-- 1. CHALLENGE_PROGRESS - Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Users can create their own progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "Users can view their own progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "Users can view own challenge progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "Users can manage own challenge progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "Admins can view all challenge progress" ON public.challenge_progress;

-- 2. GAME_SESSIONS - Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "Admins can view all game sessions" ON public.game_sessions;

-- 3. INVITE_REWARDS - Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Users can create invite rewards" ON public.invite_rewards;
DROP POLICY IF EXISTS "Users can view their own invite rewards" ON public.invite_rewards;
DROP POLICY IF EXISTS "Users can view own invite rewards" ON public.invite_rewards;
DROP POLICY IF EXISTS "System can insert invite rewards" ON public.invite_rewards;
DROP POLICY IF EXISTS "Admins can manage all invite rewards" ON public.invite_rewards;

-- 4. INVITES - Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Users can create invites" ON public.invites;
DROP POLICY IF EXISTS "Users can update their own invites" ON public.invites;
DROP POLICY IF EXISTS "Users can view their own invites" ON public.invites;
DROP POLICY IF EXISTS "Users can view own invites" ON public.invites;
DROP POLICY IF EXISTS "Users can create own invites" ON public.invites;
DROP POLICY IF EXISTS "Users can update own invites" ON public.invites;
DROP POLICY IF EXISTS "Admins can manage all invites" ON public.invites;

-- 5. PAYMENT_HISTORY - Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Only admins can modify payment history" ON public.payment_history;
DROP POLICY IF EXISTS "Users can view their own payment history" ON public.payment_history;
DROP POLICY IF EXISTS "Users can view own payment history" ON public.payment_history;
DROP POLICY IF EXISTS "System can insert payment history" ON public.payment_history;
DROP POLICY IF EXISTS "Admins can manage all payment history" ON public.payment_history;

-- 6. PRIZE_DISTRIBUTIONS - Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Users can view their own prize distributions" ON public.prize_distributions;
DROP POLICY IF EXISTS "Users can view own prize distributions" ON public.prize_distributions;
DROP POLICY IF EXISTS "System can insert prize distributions" ON public.prize_distributions;
DROP POLICY IF EXISTS "Admins can manage all prize distributions" ON public.prize_distributions;

-- 7. USER_REPORTS - Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Users can create reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can create their own reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.user_reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.user_reports;
DROP POLICY IF EXISTS "Admins can update all reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can view own reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can create own reports" ON public.user_reports;
DROP POLICY IF EXISTS "Admins can manage all reports" ON public.user_reports;

-- 8. USER_ROLES - Remover TODAS as políticas existentes (incluindo as problemáticas)
DROP POLICY IF EXISTS "admin_manage_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "allow_user_roles_insert" ON public.user_roles;
DROP POLICY IF EXISTS "select_own_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- 9. WORD_CATEGORIES - Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.word_categories;
DROP POLICY IF EXISTS "Users can view active level words" ON public.level_words;

-- 10. VERIFICAÇÃO FINAL - Confirmar que ETAPA 1 foi 100% completada
DO $$
DECLARE
    remaining_policies INTEGER;
BEGIN
    -- Contar políticas restantes nas tabelas que deveriam estar limpas
    SELECT COUNT(*) INTO remaining_policies 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename IN (
        'challenge_progress', 'game_sessions', 'invite_rewards', 
        'invites', 'payment_history', 'prize_distributions', 
        'user_reports', 'user_roles', 'word_categories'
      );
    
    IF remaining_policies = 0 THEN
        RAISE NOTICE '✅ ETAPA 1 COMPLETADA COM SUCESSO! Todas as políticas duplicadas foram removidas.';
    ELSE
        RAISE NOTICE '❌ ETAPA 1 INCOMPLETA! Ainda existem % políticas restantes.', remaining_policies;
    END IF;
END $$;

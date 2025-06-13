
-- ===================================
-- FASE 1: LIMPEZA FORÇADA E ROBUSTA - GARANTIA 100%
-- ===================================

-- Estratégia: Limpeza agressiva com verificação em loop
-- Objetivo: GARANTIR 0 políticas RLS restantes

-- ===================================
-- LIMPEZA SISTEMÁTICA POR TABELA
-- ===================================

-- 1. ADMIN_ACTIONS (Limpar todas as políticas)
DROP POLICY IF EXISTS "admin_all_admin_actions" ON public.admin_actions;
DROP POLICY IF EXISTS "admins_only_admin_actions" ON public.admin_actions;
DROP POLICY IF EXISTS "admins_can_manage_admin_actions" ON public.admin_actions;
DROP POLICY IF EXISTS "admins_manage_admin_actions" ON public.admin_actions;

-- 2. CHALLENGE_PROGRESS (Limpar todas as políticas)
DROP POLICY IF EXISTS "manage_own_challenge_progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "users_can_view_own_challenge_progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "users_can_manage_own_challenge_progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "users_manage_own_challenge_progress" ON public.challenge_progress;

-- 3. CHALLENGES (Limpar todas as políticas)
DROP POLICY IF EXISTS "select_active_challenges" ON public.challenges;
DROP POLICY IF EXISTS "admin_all_challenges" ON public.challenges;
DROP POLICY IF EXISTS "authenticated_users_can_view_challenges" ON public.challenges;
DROP POLICY IF EXISTS "admins_can_manage_challenges" ON public.challenges;
DROP POLICY IF EXISTS "authenticated_select_challenges" ON public.challenges;
DROP POLICY IF EXISTS "admins_manage_challenges" ON public.challenges;
DROP POLICY IF EXISTS "read_active_challenges" ON public.challenges;

-- 4. COMPETITION_HISTORY (Limpar todas as políticas)
DROP POLICY IF EXISTS "select_own_competition_history" ON public.competition_history;
DROP POLICY IF EXISTS "insert_competition_history" ON public.competition_history;
DROP POLICY IF EXISTS "users_view_own_competition_history" ON public.competition_history;
DROP POLICY IF EXISTS "system_insert_competition_history" ON public.competition_history;
DROP POLICY IF EXISTS "users_can_view_own_competition_history" ON public.competition_history;
DROP POLICY IF EXISTS "system_can_insert_competition_history" ON public.competition_history;
DROP POLICY IF EXISTS "users_select_own_competition_history" ON public.competition_history;

-- 5. COMPETITION_PARTICIPATIONS (Limpar todas as políticas)
DROP POLICY IF EXISTS "select_own_participations" ON public.competition_participations;
DROP POLICY IF EXISTS "insert_own_participations" ON public.competition_participations;
DROP POLICY IF EXISTS "admin_all_participations" ON public.competition_participations;
DROP POLICY IF EXISTS "users_own_participations_select" ON public.competition_participations;
DROP POLICY IF EXISTS "users_own_participations_insert" ON public.competition_participations;
DROP POLICY IF EXISTS "admins_all_participations" ON public.competition_participations;
DROP POLICY IF EXISTS "Users can view own participations" ON public.competition_participations;
DROP POLICY IF EXISTS "Users can create own participations" ON public.competition_participations;
DROP POLICY IF EXISTS "Admins can manage all participations" ON public.competition_participations;
DROP POLICY IF EXISTS "users_manage_own_participations" ON public.competition_participations;
DROP POLICY IF EXISTS "users_can_view_own_participations" ON public.competition_participations;
DROP POLICY IF EXISTS "users_can_create_participations" ON public.competition_participations;
DROP POLICY IF EXISTS "admins_can_update_participations" ON public.competition_participations;
DROP POLICY IF EXISTS "users_select_own_participations" ON public.competition_participations;
DROP POLICY IF EXISTS "users_insert_own_participations" ON public.competition_participations;
DROP POLICY IF EXISTS "admins_update_participations" ON public.competition_participations;

-- 6. COMPETITIONS (Limpar todas as políticas)
DROP POLICY IF EXISTS "select_competitions" ON public.competitions;
DROP POLICY IF EXISTS "admin_all_competitions" ON public.competitions;
DROP POLICY IF EXISTS "authenticated_users_can_view_competitions_table" ON public.competitions;
DROP POLICY IF EXISTS "admins_can_manage_competitions_table" ON public.competitions;
DROP POLICY IF EXISTS "authenticated_select_competitions_table" ON public.competitions;
DROP POLICY IF EXISTS "admins_manage_competitions_table" ON public.competitions;

-- 7. CUSTOM_COMPETITIONS (Limpar todas as políticas)
DROP POLICY IF EXISTS "select_custom_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "admin_all_custom_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "all_view_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "admins_insert_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "admins_update_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "admins_delete_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "authenticated_users_can_view_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "admins_can_manage_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "authenticated_select_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "admins_manage_competitions" ON public.custom_competitions;

-- 8. GAME_SESSIONS (Limpar todas as políticas)
DROP POLICY IF EXISTS "manage_own_game_sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "users_own_sessions_select" ON public.game_sessions;
DROP POLICY IF EXISTS "users_own_sessions_insert" ON public.game_sessions;
DROP POLICY IF EXISTS "users_own_sessions_update" ON public.game_sessions;
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "users_manage_own_sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "users_can_manage_own_sessions" ON public.game_sessions;

-- 9. GAME_SETTINGS (Limpar todas as políticas)
DROP POLICY IF EXISTS "select_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "admin_all_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "read_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "all_read_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "admins_insert_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "admins_update_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "admins_delete_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "authenticated_users_can_read_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "admins_can_manage_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "authenticated_select_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "admins_manage_game_settings" ON public.game_settings;

-- 10. INVITE_REWARDS (Limpar todas as políticas)
DROP POLICY IF EXISTS "select_own_invite_rewards" ON public.invite_rewards;
DROP POLICY IF EXISTS "admin_all_invite_rewards" ON public.invite_rewards;
DROP POLICY IF EXISTS "users_can_view_own_invite_rewards" ON public.invite_rewards;
DROP POLICY IF EXISTS "system_can_manage_invite_rewards" ON public.invite_rewards;
DROP POLICY IF EXISTS "users_select_own_invite_rewards" ON public.invite_rewards;
DROP POLICY IF EXISTS "system_manage_invite_rewards" ON public.invite_rewards;

-- 11. INVITES (Limpar todas as políticas)
DROP POLICY IF EXISTS "select_related_invites" ON public.invites;
DROP POLICY IF EXISTS "insert_own_invites" ON public.invites;
DROP POLICY IF EXISTS "update_related_invites" ON public.invites;
DROP POLICY IF EXISTS "users_can_view_related_invites" ON public.invites;
DROP POLICY IF EXISTS "users_can_create_invites" ON public.invites;
DROP POLICY IF EXISTS "users_can_update_own_invites" ON public.invites;
DROP POLICY IF EXISTS "users_select_related_invites" ON public.invites;
DROP POLICY IF EXISTS "users_insert_invites" ON public.invites;
DROP POLICY IF EXISTS "users_update_own_invites" ON public.invites;

-- 12. LEVEL_WORDS (Limpar todas as políticas)
DROP POLICY IF EXISTS "select_active_level_words" ON public.level_words;
DROP POLICY IF EXISTS "admin_all_level_words" ON public.level_words;
DROP POLICY IF EXISTS "authenticated_users_can_view_level_words" ON public.level_words;
DROP POLICY IF EXISTS "admins_can_manage_level_words" ON public.level_words;
DROP POLICY IF EXISTS "authenticated_select_level_words" ON public.level_words;
DROP POLICY IF EXISTS "admins_manage_level_words" ON public.level_words;

-- 13. PAYMENT_HISTORY (Limpar todas as políticas)
DROP POLICY IF EXISTS "select_own_payment_history" ON public.payment_history;
DROP POLICY IF EXISTS "admin_all_payment_history" ON public.payment_history;
DROP POLICY IF EXISTS "users_view_own_payments" ON public.payment_history;
DROP POLICY IF EXISTS "admins_insert_payments" ON public.payment_history;
DROP POLICY IF EXISTS "admins_update_payments" ON public.payment_history;
DROP POLICY IF EXISTS "admins_delete_payments" ON public.payment_history;
DROP POLICY IF EXISTS "users_can_view_own_payments" ON public.payment_history;
DROP POLICY IF EXISTS "admins_can_manage_payments" ON public.payment_history;
DROP POLICY IF EXISTS "users_select_own_payments" ON public.payment_history;
DROP POLICY IF EXISTS "admins_manage_payments" ON public.payment_history;

-- 14. PRIZE_CONFIGURATIONS (Limpar todas as políticas)
DROP POLICY IF EXISTS "select_active_prize_configs" ON public.prize_configurations;
DROP POLICY IF EXISTS "admin_all_prize_configs" ON public.prize_configurations;
DROP POLICY IF EXISTS "authenticated_users_can_view_prize_configs" ON public.prize_configurations;
DROP POLICY IF EXISTS "admins_can_manage_prize_configs" ON public.prize_configurations;
DROP POLICY IF EXISTS "authenticated_select_prize_configs" ON public.prize_configurations;
DROP POLICY IF EXISTS "admins_manage_prize_configs" ON public.prize_configurations;

-- 15. PRIZE_DISTRIBUTIONS (Limpar todas as políticas)
DROP POLICY IF EXISTS "select_own_prize_distributions" ON public.prize_distributions;
DROP POLICY IF EXISTS "admin_all_prize_distributions" ON public.prize_distributions;
DROP POLICY IF EXISTS "users_view_own_prizes" ON public.prize_distributions;
DROP POLICY IF EXISTS "admins_insert_prizes" ON public.prize_distributions;
DROP POLICY IF EXISTS "admins_update_prizes" ON public.prize_distributions;
DROP POLICY IF EXISTS "admins_delete_prizes" ON public.prize_distributions;
DROP POLICY IF EXISTS "users_can_view_own_prizes" ON public.prize_distributions;
DROP POLICY IF EXISTS "admins_can_manage_prizes" ON public.prize_distributions;
DROP POLICY IF EXISTS "users_select_own_prizes" ON public.prize_distributions;
DROP POLICY IF EXISTS "admins_manage_prizes" ON public.prize_distributions;

-- 16. PROFILES (Limpar todas as políticas)
DROP POLICY IF EXISTS "select_own_profiles" ON public.profiles;
DROP POLICY IF EXISTS "update_own_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admins_manage_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_can_manage_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admins_can_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_can_update_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admins_select_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_update_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 17. USER_REPORTS (Limpar todas as políticas)
DROP POLICY IF EXISTS "select_own_user_reports" ON public.user_reports;
DROP POLICY IF EXISTS "insert_user_reports" ON public.user_reports;
DROP POLICY IF EXISTS "admin_all_user_reports" ON public.user_reports;
DROP POLICY IF EXISTS "users_can_view_own_reports" ON public.user_reports;
DROP POLICY IF EXISTS "users_can_create_reports" ON public.user_reports;
DROP POLICY IF EXISTS "admins_can_manage_reports" ON public.user_reports;
DROP POLICY IF EXISTS "users_select_own_reports" ON public.user_reports;
DROP POLICY IF EXISTS "users_insert_reports" ON public.user_reports;
DROP POLICY IF EXISTS "admins_manage_reports" ON public.user_reports;

-- 18. USER_ROLES (Limpar todas as políticas)
DROP POLICY IF EXISTS "select_own_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admin_all_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "view_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "manage_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "users_view_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins_manage_all_roles" ON public.user_roles;
DROP POLICY IF EXISTS "users_can_view_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins_can_manage_all_roles" ON public.user_roles;
DROP POLICY IF EXISTS "users_select_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- 19. USER_WORD_HISTORY (Limpar todas as políticas)
DROP POLICY IF EXISTS "manage_own_word_history" ON public.user_word_history;
DROP POLICY IF EXISTS "Users can view own word history" ON public.user_word_history;
DROP POLICY IF EXISTS "Users can insert own word history" ON public.user_word_history;
DROP POLICY IF EXISTS "Admins can view all word history" ON public.user_word_history;
DROP POLICY IF EXISTS "users_manage_own_word_history" ON public.user_word_history;
DROP POLICY IF EXISTS "users_can_manage_own_word_history" ON public.user_word_history;

-- 20. WEEKLY_RANKINGS (Limpar todas as políticas)
DROP POLICY IF EXISTS "select_weekly_rankings" ON public.weekly_rankings;
DROP POLICY IF EXISTS "system_all_weekly_rankings" ON public.weekly_rankings;
DROP POLICY IF EXISTS "view_weekly_rankings" ON public.weekly_rankings;
DROP POLICY IF EXISTS "insert_weekly_rankings" ON public.weekly_rankings;
DROP POLICY IF EXISTS "authenticated_users_can_view_weekly_rankings" ON public.weekly_rankings;
DROP POLICY IF EXISTS "system_can_manage_weekly_rankings" ON public.weekly_rankings;
DROP POLICY IF EXISTS "authenticated_select_weekly_rankings" ON public.weekly_rankings;
DROP POLICY IF EXISTS "system_manage_weekly_rankings" ON public.weekly_rankings;

-- 21. WORD_CATEGORIES (Limpar todas as políticas)
DROP POLICY IF EXISTS "select_active_word_categories" ON public.word_categories;
DROP POLICY IF EXISTS "admin_all_word_categories" ON public.word_categories;
DROP POLICY IF EXISTS "authenticated_users_can_view_word_categories" ON public.word_categories;
DROP POLICY IF EXISTS "admins_can_manage_word_categories" ON public.word_categories;
DROP POLICY IF EXISTS "authenticated_select_word_categories" ON public.word_categories;
DROP POLICY IF EXISTS "admins_manage_word_categories" ON public.word_categories;

-- 22. WORDS_FOUND (Limpar todas as políticas)
DROP POLICY IF EXISTS "select_session_words_found" ON public.words_found;
DROP POLICY IF EXISTS "insert_session_words_found" ON public.words_found;
DROP POLICY IF EXISTS "users_can_view_session_words_found" ON public.words_found;
DROP POLICY IF EXISTS "users_can_insert_words_found" ON public.words_found;
DROP POLICY IF EXISTS "users_select_session_words_found" ON public.words_found;
DROP POLICY IF EXISTS "users_insert_words_found" ON public.words_found;

-- ===================================
-- VERIFICAÇÃO CRÍTICA PÓS-LIMPEZA
-- ===================================

-- Esta verificação vai confirmar se chegamos a 0 políticas
DO $$
DECLARE
    remaining_policies INTEGER;
    policy_list TEXT;
BEGIN
    -- Contar políticas restantes
    SELECT COUNT(*) INTO remaining_policies 
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    -- Se ainda existem políticas, listar quais são
    IF remaining_policies > 0 THEN
        SELECT string_agg(
            schemaname || '.' || tablename || '.' || policyname, 
            ', '
        ) INTO policy_list
        FROM pg_policies 
        WHERE schemaname = 'public'
        LIMIT 20; -- Mostrar até 20 para não sobrecarregar o log
        
        RAISE NOTICE 'ATENÇÃO: Ainda existem % políticas restantes: %', 
                     remaining_policies, policy_list;
        RAISE NOTICE 'FASE 1 INCOMPLETA - Necessária limpeza adicional!';
    ELSE
        RAISE NOTICE 'SUCESSO: FASE 1 COMPLETA - 0 políticas RLS restantes!';
        RAISE NOTICE 'Sistema pronto para Fase 2 - Validação Crítica';
    END IF;
END $$;


-- ===================================
-- FASE 1: LIMPEZA COMPLETA DE TODAS AS POLÍTICAS RLS
-- ===================================

-- ADMIN_ACTIONS
DROP POLICY IF EXISTS "admins_only_admin_actions" ON public.admin_actions;
DROP POLICY IF EXISTS "admins_can_manage_admin_actions" ON public.admin_actions;
DROP POLICY IF EXISTS "admins_manage_admin_actions" ON public.admin_actions;

-- CHALLENGE_PROGRESS  
DROP POLICY IF EXISTS "users_can_view_own_challenge_progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "users_can_manage_own_challenge_progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "users_manage_own_challenge_progress" ON public.challenge_progress;

-- CHALLENGES
DROP POLICY IF EXISTS "authenticated_users_can_view_challenges" ON public.challenges;
DROP POLICY IF EXISTS "admins_can_manage_challenges" ON public.challenges;
DROP POLICY IF EXISTS "authenticated_select_challenges" ON public.challenges;
DROP POLICY IF EXISTS "admins_manage_challenges" ON public.challenges;
DROP POLICY IF EXISTS "read_active_challenges" ON public.challenges;

-- COMPETITION_HISTORY
DROP POLICY IF EXISTS "users_view_own_competition_history" ON public.competition_history;
DROP POLICY IF EXISTS "system_insert_competition_history" ON public.competition_history;
DROP POLICY IF EXISTS "users_can_view_own_competition_history" ON public.competition_history;
DROP POLICY IF EXISTS "system_can_insert_competition_history" ON public.competition_history;
DROP POLICY IF EXISTS "users_select_own_competition_history" ON public.competition_history;

-- COMPETITION_PARTICIPATIONS
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

-- COMPETITIONS
DROP POLICY IF EXISTS "authenticated_users_can_view_competitions_table" ON public.competitions;
DROP POLICY IF EXISTS "admins_can_manage_competitions_table" ON public.competitions;
DROP POLICY IF EXISTS "authenticated_select_competitions_table" ON public.competitions;
DROP POLICY IF EXISTS "admins_manage_competitions_table" ON public.competitions;

-- CUSTOM_COMPETITIONS
DROP POLICY IF EXISTS "all_view_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "admins_insert_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "admins_update_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "admins_delete_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "authenticated_users_can_view_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "admins_can_manage_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "authenticated_select_competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "admins_manage_competitions" ON public.custom_competitions;

-- GAME_SESSIONS
DROP POLICY IF EXISTS "users_own_sessions_select" ON public.game_sessions;
DROP POLICY IF EXISTS "users_own_sessions_insert" ON public.game_sessions;
DROP POLICY IF EXISTS "users_own_sessions_update" ON public.game_sessions;
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "users_manage_own_sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "users_can_manage_own_sessions" ON public.game_sessions;

-- GAME_SETTINGS
DROP POLICY IF EXISTS "read_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "all_read_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "admins_insert_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "admins_update_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "admins_delete_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "authenticated_users_can_read_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "admins_can_manage_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "authenticated_select_game_settings" ON public.game_settings;
DROP POLICY IF EXISTS "admins_manage_game_settings" ON public.game_settings;

-- INVITE_REWARDS
DROP POLICY IF EXISTS "users_can_view_own_invite_rewards" ON public.invite_rewards;
DROP POLICY IF EXISTS "system_can_manage_invite_rewards" ON public.invite_rewards;
DROP POLICY IF EXISTS "users_select_own_invite_rewards" ON public.invite_rewards;
DROP POLICY IF EXISTS "system_manage_invite_rewards" ON public.invite_rewards;

-- INVITES
DROP POLICY IF EXISTS "users_can_view_related_invites" ON public.invites;
DROP POLICY IF EXISTS "users_can_create_invites" ON public.invites;
DROP POLICY IF EXISTS "users_can_update_own_invites" ON public.invites;
DROP POLICY IF EXISTS "users_select_related_invites" ON public.invites;
DROP POLICY IF EXISTS "users_insert_invites" ON public.invites;
DROP POLICY IF EXISTS "users_update_own_invites" ON public.invites;

-- LEVEL_WORDS
DROP POLICY IF EXISTS "authenticated_users_can_view_level_words" ON public.level_words;
DROP POLICY IF EXISTS "admins_can_manage_level_words" ON public.level_words;
DROP POLICY IF EXISTS "authenticated_select_level_words" ON public.level_words;
DROP POLICY IF EXISTS "admins_manage_level_words" ON public.level_words;

-- PAYMENT_HISTORY
DROP POLICY IF EXISTS "users_view_own_payments" ON public.payment_history;
DROP POLICY IF EXISTS "admins_insert_payments" ON public.payment_history;
DROP POLICY IF EXISTS "admins_update_payments" ON public.payment_history;
DROP POLICY IF EXISTS "admins_delete_payments" ON public.payment_history;
DROP POLICY IF EXISTS "users_can_view_own_payments" ON public.payment_history;
DROP POLICY IF EXISTS "admins_can_manage_payments" ON public.payment_history;
DROP POLICY IF EXISTS "users_select_own_payments" ON public.payment_history;
DROP POLICY IF EXISTS "admins_manage_payments" ON public.payment_history;

-- PRIZE_CONFIGURATIONS
DROP POLICY IF EXISTS "authenticated_users_can_view_prize_configs" ON public.prize_configurations;
DROP POLICY IF EXISTS "admins_can_manage_prize_configs" ON public.prize_configurations;
DROP POLICY IF EXISTS "authenticated_select_prize_configs" ON public.prize_configurations;
DROP POLICY IF EXISTS "admins_manage_prize_configs" ON public.prize_configurations;

-- PRIZE_DISTRIBUTIONS
DROP POLICY IF EXISTS "users_view_own_prizes" ON public.prize_distributions;
DROP POLICY IF EXISTS "admins_insert_prizes" ON public.prize_distributions;
DROP POLICY IF EXISTS "admins_update_prizes" ON public.prize_distributions;
DROP POLICY IF EXISTS "admins_delete_prizes" ON public.prize_distributions;
DROP POLICY IF EXISTS "users_can_view_own_prizes" ON public.prize_distributions;
DROP POLICY IF EXISTS "admins_can_manage_prizes" ON public.prize_distributions;
DROP POLICY IF EXISTS "users_select_own_prizes" ON public.prize_distributions;
DROP POLICY IF EXISTS "admins_manage_prizes" ON public.prize_distributions;

-- PROFILES
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

-- USER_REPORTS
DROP POLICY IF EXISTS "users_can_view_own_reports" ON public.user_reports;
DROP POLICY IF EXISTS "users_can_create_reports" ON public.user_reports;
DROP POLICY IF EXISTS "admins_can_manage_reports" ON public.user_reports;
DROP POLICY IF EXISTS "users_select_own_reports" ON public.user_reports;
DROP POLICY IF EXISTS "users_insert_reports" ON public.user_reports;
DROP POLICY IF EXISTS "admins_manage_reports" ON public.user_reports;

-- USER_ROLES
DROP POLICY IF EXISTS "view_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "manage_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "users_view_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins_manage_all_roles" ON public.user_roles;
DROP POLICY IF EXISTS "users_can_view_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins_can_manage_all_roles" ON public.user_roles;
DROP POLICY IF EXISTS "users_select_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- USER_WORD_HISTORY
DROP POLICY IF EXISTS "Users can view own word history" ON public.user_word_history;
DROP POLICY IF EXISTS "Users can insert own word history" ON public.user_word_history;
DROP POLICY IF EXISTS "Admins can view all word history" ON public.user_word_history;
DROP POLICY IF EXISTS "users_manage_own_word_history" ON public.user_word_history;
DROP POLICY IF EXISTS "users_can_manage_own_word_history" ON public.user_word_history;

-- WEEKLY_RANKINGS
DROP POLICY IF EXISTS "view_weekly_rankings" ON public.weekly_rankings;
DROP POLICY IF EXISTS "insert_weekly_rankings" ON public.weekly_rankings;
DROP POLICY IF EXISTS "authenticated_users_can_view_weekly_rankings" ON public.weekly_rankings;
DROP POLICY IF EXISTS "system_can_manage_weekly_rankings" ON public.weekly_rankings;
DROP POLICY IF EXISTS "authenticated_select_weekly_rankings" ON public.weekly_rankings;
DROP POLICY IF EXISTS "system_manage_weekly_rankings" ON public.weekly_rankings;

-- WORD_CATEGORIES
DROP POLICY IF EXISTS "authenticated_users_can_view_word_categories" ON public.word_categories;
DROP POLICY IF EXISTS "admins_can_manage_word_categories" ON public.word_categories;
DROP POLICY IF EXISTS "authenticated_select_word_categories" ON public.word_categories;
DROP POLICY IF EXISTS "admins_manage_word_categories" ON public.word_categories;

-- WORDS_FOUND
DROP POLICY IF EXISTS "users_can_view_session_words_found" ON public.words_found;
DROP POLICY IF EXISTS "users_can_insert_words_found" ON public.words_found;
DROP POLICY IF EXISTS "users_select_session_words_found" ON public.words_found;
DROP POLICY IF EXISTS "users_insert_words_found" ON public.words_found;

-- ===================================
-- VERIFICAÇÃO FINAL
-- ===================================

-- Log de confirmação da limpeza
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    RAISE NOTICE 'FASE 1 CONCLUÍDA: % políticas RLS removidas. Total restante: %', 
                 policy_count, policy_count;
END $$;

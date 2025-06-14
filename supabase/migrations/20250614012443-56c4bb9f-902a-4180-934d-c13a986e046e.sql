
-- ===================================
-- FINALIZAÇÃO ETAPA 1: REMOÇÃO DAS POLÍTICAS RESTANTES
-- ===================================

-- 1. GAME_SESSIONS - Remover políticas restantes
DROP POLICY IF EXISTS "users_own_sessions_select" ON public.game_sessions;
DROP POLICY IF EXISTS "users_own_sessions_insert" ON public.game_sessions;
DROP POLICY IF EXISTS "users_own_sessions_update" ON public.game_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.game_sessions;

-- 2. INVITES - Remover política restante
DROP POLICY IF EXISTS "Users can view invited users" ON public.invites;

-- 3. USER_ROLES - Remover políticas restantes (incluindo as problemáticas)
DROP POLICY IF EXISTS "view_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "manage_own_roles" ON public.user_roles;

-- 4. WORD_CATEGORIES - Remover políticas restantes
DROP POLICY IF EXISTS "Users can view word categories" ON public.word_categories;
DROP POLICY IF EXISTS "Admins can manage word categories" ON public.word_categories;
DROP POLICY IF EXISTS "authenticated_users_can_view_categories" ON public.word_categories;
DROP POLICY IF EXISTS "admins_can_manage_categories" ON public.word_categories;

-- 5. VERIFICAÇÃO FINAL - Confirmar que ETAPA 1 foi 100% completada
DO $$
DECLARE
    remaining_policies INTEGER;
    policy_details RECORD;
BEGIN
    -- Contar todas as políticas restantes nas tabelas problemáticas
    SELECT COUNT(*) INTO remaining_policies 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename IN ('game_sessions', 'invites', 'user_roles', 'word_categories');
    
    IF remaining_policies = 0 THEN
        RAISE NOTICE '✅ ETAPA 1 FINALIZADA COM SUCESSO! Todas as políticas foram removidas.';
        RAISE NOTICE '🎯 Sistema pronto para ETAPA 2 - criação de políticas padronizadas.';
    ELSE
        RAISE NOTICE '❌ ETAPA 1 AINDA INCOMPLETA! Restam % políticas:', remaining_policies;
        
        -- Listar políticas restantes para debug
        FOR policy_details IN 
            SELECT tablename, policyname 
            FROM pg_policies 
            WHERE schemaname = 'public' 
              AND tablename IN ('game_sessions', 'invites', 'user_roles', 'word_categories')
            ORDER BY tablename, policyname
        LOOP
            RAISE NOTICE '  - %.%', policy_details.tablename, policy_details.policyname;
        END LOOP;
    END IF;
END $$;

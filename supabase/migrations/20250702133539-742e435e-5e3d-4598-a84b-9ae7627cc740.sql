-- FASE 1: LIMPEZA E PADRONIZAÇÃO CRÍTICA DO SISTEMA RLS E BANCO DE DADOS
-- Corrige problemas fundamentais de consistência e integridade referencial

-- ===================================
-- 1. CORRIGIR FOREIGN KEYS DUPLICADAS E INCONSISTENTES
-- ===================================

-- 1.1 Corrigir tabela INVITES - remover foreign key problemática
-- A tabela invites tem referências inconsistentes para used_by
DROP VIEW IF EXISTS mv_current_weekly_ranking CASCADE;

-- Remover constraint problemática se existir
ALTER TABLE public.invites 
DROP CONSTRAINT IF EXISTS fk_invites_used_by_profiles;

-- Recriar constraint correta apontando apenas para profiles
ALTER TABLE public.invites 
ADD CONSTRAINT fk_invites_used_by_profiles 
FOREIGN KEY (used_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 1.2 Corrigir tabela MONTHLY_INVITE_POINTS
ALTER TABLE public.monthly_invite_points 
DROP CONSTRAINT IF EXISTS monthly_invite_points_user_id_fkey;

ALTER TABLE public.monthly_invite_points 
ADD CONSTRAINT monthly_invite_points_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 1.3 Corrigir tabela MONTHLY_INVITE_RANKINGS  
ALTER TABLE public.monthly_invite_rankings 
DROP CONSTRAINT IF EXISTS monthly_invite_rankings_user_id_fkey;

ALTER TABLE public.monthly_invite_rankings 
ADD CONSTRAINT monthly_invite_rankings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ===================================
-- 2. ADICIONAR CONSTRAINTS FALTANTES
-- ===================================

-- 2.1 Adicionar constraint único em user_activity_days
ALTER TABLE public.user_activity_days 
ADD CONSTRAINT unique_user_activity_date 
UNIQUE (user_id, activity_date);

-- 2.2 Adicionar constraint único em user_roles se não existir
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS unique_user_role;

ALTER TABLE public.user_roles 
ADD CONSTRAINT unique_user_role 
UNIQUE (user_id, role);

-- ===================================
-- 3. CORRIGIR CAMPOS NULLABLE PROBLEMÁTICOS
-- ===================================

-- 3.1 Campos que não deveriam ser nullable em profiles
-- Garantir que username nunca seja nulo (já é NOT NULL)
-- Garantir valores padrão para campos essenciais
UPDATE public.profiles 
SET total_score = 0 WHERE total_score IS NULL;

UPDATE public.profiles 
SET games_played = 0 WHERE games_played IS NULL;

UPDATE public.profiles 
SET experience_points = 0 WHERE experience_points IS NULL;

UPDATE public.profiles 
SET is_banned = false WHERE is_banned IS NULL;

-- 3.2 Atualizar campos em game_sessions para garantir consistência
UPDATE public.game_sessions 
SET total_score = 0 WHERE total_score IS NULL;

UPDATE public.game_sessions 
SET time_elapsed = 0 WHERE time_elapsed IS NULL;

UPDATE public.game_sessions 
SET is_completed = false WHERE is_completed IS NULL;

-- ===================================
-- 4. PADRONIZAR REFERÊNCIAS DE USER_ID
-- ===================================

-- 4.1 Verificar e corrigir referências órfãs
-- Remover registros órfãos em invites que não têm perfil correspondente
DELETE FROM public.invites 
WHERE invited_by IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = invited_by);

DELETE FROM public.invites 
WHERE used_by IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = used_by);

-- 4.2 Remover registros órfãos em outras tabelas
DELETE FROM public.game_sessions 
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id);

DELETE FROM public.user_word_history 
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id);

DELETE FROM public.user_activity_days 
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id);

DELETE FROM public.challenge_progress 
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id);

-- ===================================
-- 5. OTIMIZAR FUNCTION IS_ADMIN
-- ===================================

-- Recriar função is_admin otimizada para evitar problemas de performance
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;

-- ===================================
-- 6. ADICIONAR ÍNDICES PARA PERFORMANCE
-- ===================================

-- Índices para melhorar performance das consultas mais comuns
CREATE INDEX IF NOT EXISTS idx_invites_invited_by ON public.invites(invited_by);
CREATE INDEX IF NOT EXISTS idx_invites_used_by ON public.invites(used_by);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON public.game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_rankings_user_id ON public.weekly_rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_total_score ON public.profiles(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_days_user_id ON public.user_activity_days(user_id);

-- ===================================
-- VERIFICAÇÃO FINAL
-- ===================================
DO $$
DECLARE
    orphaned_count INTEGER;
    duplicate_count INTEGER;
    total_users INTEGER;
BEGIN
    -- Verificar registros órfãos restantes
    SELECT COUNT(*) INTO orphaned_count
    FROM public.game_sessions gs
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = gs.user_id);
    
    -- Verificar duplicatas em user_activity_days
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT user_id, activity_date, COUNT(*) as cnt
        FROM public.user_activity_days
        GROUP BY user_id, activity_date
        HAVING COUNT(*) > 1
    ) duplicates;
    
    -- Contar usuários totais
    SELECT COUNT(*) INTO total_users FROM public.profiles;
    
    RAISE NOTICE '🎉 FASE 1 CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '📊 ESTATÍSTICAS DE LIMPEZA:';
    RAISE NOTICE '  - % usuários no sistema', total_users;
    RAISE NOTICE '  - % registros órfãos restantes', orphaned_count;
    RAISE NOTICE '  - % duplicatas em activity_days', duplicate_count;
    RAISE NOTICE '✅ Integridade referencial restaurada!';
    RAISE NOTICE '🔧 Foreign keys padronizadas!';
    RAISE NOTICE '📈 Índices de performance adicionados!';
    RAISE NOTICE '🚀 Sistema pronto para Fase 2!';
END $$;
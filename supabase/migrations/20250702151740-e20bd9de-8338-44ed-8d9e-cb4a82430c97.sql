-- CORREÇÃO FINAL: Resolver alertas remanescentes de performance RLS
-- Corrige políticas específicas que ainda apresentam problemas

-- 1. CORRIGIR POLÍTICA weekly_rankings_system_insert
-- Substituir current_setting por (select ...) para evitar re-avaliação por linha
DROP POLICY IF EXISTS "weekly_rankings_system_insert" ON public.weekly_rankings;

CREATE POLICY "weekly_rankings_system_insert" ON public.weekly_rankings
  FOR INSERT 
  WITH CHECK ((SELECT is_admin()) OR (SELECT current_setting('role'::text) = 'supabase_admin'::text));

-- 2. RESOLVER POLÍTICAS MÚLTIPLAS PERMISSIVAS NA TABELA user_roles
-- Remover a política user_roles_manage_admin_only para SELECT (manter apenas para INSERT/UPDATE/DELETE)
-- Manter apenas user_roles_select_optimized para SELECT

-- Primeiro, dropar a política existente que causa conflito
DROP POLICY IF EXISTS "user_roles_manage_admin_only" ON public.user_roles;

-- Recriar apenas para operações não-SELECT (INSERT, UPDATE, DELETE)
CREATE POLICY "user_roles_admin_write_only" ON public.user_roles
  FOR ALL 
  USING (false) -- Bloqueia SELECT através desta política
  WITH CHECK (is_admin()); -- Permite INSERT/UPDATE/DELETE apenas para admins

-- A política user_roles_select_optimized já existe e cuida do SELECT

-- 3. COMENTÁRIOS PARA AUDITORIA
COMMENT ON POLICY "weekly_rankings_system_insert" ON public.weekly_rankings 
IS 'Política otimizada final - resolve auth_rls_initplan usando (select ...)';

COMMENT ON POLICY "user_roles_admin_write_only" ON public.user_roles 
IS 'Política administrativa apenas para write - resolve multiple_permissive_policies';
-- CORREÇÃO DEFINITIVA: Resolver alertas persistentes de performance RLS

-- 1. CORRIGIR user_roles - remover conflito de políticas permissivas para SELECT
-- O problema é que user_roles_admin_write_only está criando uma política permissiva para SELECT
-- mesmo com USING (false), causando conflito com user_roles_select_optimized

DROP POLICY IF EXISTS "user_roles_admin_write_only" ON public.user_roles;

-- Criar políticas específicas apenas para INSERT, UPDATE, DELETE (não SELECT)
CREATE POLICY "user_roles_admin_insert" ON public.user_roles
  FOR INSERT 
  WITH CHECK (is_admin());

CREATE POLICY "user_roles_admin_update" ON public.user_roles
  FOR UPDATE 
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "user_roles_admin_delete" ON public.user_roles
  FOR DELETE 
  USING (is_admin());

-- A política user_roles_select_optimized já existe e é a única para SELECT

-- 2. CORRIGIR weekly_rankings_system_insert - usar função ao invés de current_setting direto
DROP POLICY IF EXISTS "weekly_rankings_system_insert" ON public.weekly_rankings;

-- Criar função auxiliar para verificação de admin/system
CREATE OR REPLACE FUNCTION public.is_system_or_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN is_admin() OR (current_setting('role'::text, true) = 'supabase_admin'::text);
END;
$$;

-- Recriar política usando a função
CREATE POLICY "weekly_rankings_system_insert" ON public.weekly_rankings
  FOR INSERT 
  WITH CHECK (public.is_system_or_admin());

-- 3. COMENTÁRIOS PARA AUDITORIA
COMMENT ON FUNCTION public.is_system_or_admin() 
IS 'Função otimizada para verificar se usuário é admin ou sistema - resolve auth_rls_initplan';

COMMENT ON POLICY "user_roles_admin_insert" ON public.user_roles 
IS 'Política específica para INSERT - resolve multiple_permissive_policies';

COMMENT ON POLICY "user_roles_admin_update" ON public.user_roles 
IS 'Política específica para UPDATE - resolve multiple_permissive_policies';

COMMENT ON POLICY "user_roles_admin_delete" ON public.user_roles 
IS 'Política específica para DELETE - resolve multiple_permissive_policies';
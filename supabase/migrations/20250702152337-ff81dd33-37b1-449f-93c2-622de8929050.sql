-- CORREÇÃO DE SEGURANÇA: Corrigir search_path da função is_system_or_admin

-- Recriar a função com search_path fixo para resolver alerta de segurança
CREATE OR REPLACE FUNCTION public.is_system_or_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
BEGIN
  RETURN public.is_admin() OR (current_setting('role'::text, true) = 'supabase_admin'::text);
END;
$$;

-- Atualizar comentário
COMMENT ON FUNCTION public.is_system_or_admin() 
IS 'Função segura otimizada para verificar se usuário é admin ou sistema - resolve auth_rls_initplan e function_search_path_mutable';
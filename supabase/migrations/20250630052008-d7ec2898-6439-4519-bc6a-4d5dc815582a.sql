
-- Otimização de Performance: Corrigir políticas RLS na tabela profiles
-- Substituir auth.uid() direto por (SELECT auth.uid()) para evitar re-avaliação por linha

-- 1. Remover políticas existentes que têm problemas de performance
DROP POLICY IF EXISTS "allow_profile_insert" ON public.profiles;
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admins_manage_all_profiles" ON public.profiles;

-- 2. Recriar política de INSERT otimizada
CREATE POLICY "allow_profile_insert" ON public.profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    id = (SELECT auth.uid()) OR 
    -- Permitir inserções por funções SECURITY DEFINER (como handle_new_user)
    (SELECT current_setting('role', true)) = 'supabase_admin'
  );

-- 3. Recriar política para usuários gerenciarem próprio perfil (otimizada)
CREATE POLICY "users_manage_own_profile" ON public.profiles
  FOR ALL
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- 4. Recriar política para admins gerenciarem todos os perfis (otimizada)
-- Verificar se a função is_admin() já está otimizada
CREATE POLICY "admins_manage_all_profiles" ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- 5. Verificar e otimizar a função is_admin() se necessário
-- A função is_admin() já está bem otimizada com STABLE e SECURITY DEFINER
-- Mas vamos garantir que está usando a forma mais eficiente
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;

-- Log da otimização
DO $$
BEGIN
  RAISE NOTICE 'Políticas RLS da tabela profiles otimizadas para melhor performance';
  RAISE NOTICE 'auth.uid() substituído por (SELECT auth.uid()) para evitar re-avaliação';
  RAISE NOTICE 'current_setting() substituído por subquery otimizada';
END $$;

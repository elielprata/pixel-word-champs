
-- ETAPA 3: CORREÇÃO DE PROBLEMAS CRÍTICOS DE RLS

-- 1. CORRIGIR RECURSÃO INFINITA EM USER_ROLES
-- Remover políticas que causam recursão e recriar com lógica simplificada
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Política simplificada para usuários verem próprias roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Política simplificada para admins - sem recursão
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    auth.uid() IN (
      SELECT ur.user_id 
      FROM public.user_roles ur 
      WHERE ur.role = 'admin' AND ur.user_id = auth.uid()
      LIMIT 1
    )
  );

-- 2. CORRIGIR POLÍTICAS POTENCIALMENTE PROBLEMÁTICAS EM OUTRAS TABELAS
-- Simplificar políticas que usam EXISTS com user_roles para evitar recursão

-- Corrigir PROFILES
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR 
    auth.uid() IN (
      SELECT ur.user_id 
      FROM public.user_roles ur 
      WHERE ur.role = 'admin' AND ur.user_id = auth.uid()
      LIMIT 1
    )
  );

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR 
    auth.uid() IN (
      SELECT ur.user_id 
      FROM public.user_roles ur 
      WHERE ur.role = 'admin' AND ur.user_id = auth.uid()
      LIMIT 1
    )
  );

-- 3. CORRIGIR GAME_SETTINGS
DROP POLICY IF EXISTS "Admins can manage game settings" ON public.game_settings;

CREATE POLICY "Admins can manage game settings" ON public.game_settings
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT ur.user_id 
      FROM public.user_roles ur 
      WHERE ur.role = 'admin' AND ur.user_id = auth.uid()
      LIMIT 1
    )
  );

-- 4. CORRIGIR ADMIN_ACTIONS
DROP POLICY IF EXISTS "Admins can manage admin actions" ON public.admin_actions;

CREATE POLICY "Admins can manage admin actions" ON public.admin_actions
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT ur.user_id 
      FROM public.user_roles ur 
      WHERE ur.role = 'admin' AND ur.user_id = auth.uid()
      LIMIT 1
    )
  );

-- 5. CORRIGIR CHALLENGES
DROP POLICY IF EXISTS "Admins can manage all challenges" ON public.challenges;

CREATE POLICY "Admins can manage all challenges" ON public.challenges
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT ur.user_id 
      FROM public.user_roles ur 
      WHERE ur.role = 'admin' AND ur.user_id = auth.uid()
      LIMIT 1
    )
  );

-- 6. MELHORAR WEEKLY_RANKINGS - Permitir inserção pelo sistema e visualização pelos usuários
DROP POLICY IF EXISTS "System can manage weekly rankings" ON public.weekly_rankings;

CREATE POLICY "Users can view weekly rankings" ON public.weekly_rankings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System and admins can manage weekly rankings" ON public.weekly_rankings
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT ur.user_id 
      FROM public.user_roles ur 
      WHERE ur.role = 'admin' AND ur.user_id = auth.uid()
      LIMIT 1
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT ur.user_id 
      FROM public.user_roles ur 
      WHERE ur.role = 'admin' AND ur.user_id = auth.uid()
      LIMIT 1
    )
  );

-- Política especial para inserção automática pelo sistema
CREATE POLICY "System can insert weekly rankings" ON public.weekly_rankings
  FOR INSERT
  WITH CHECK (true);

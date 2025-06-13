
-- CORREÇÃO URGENTE: RESOLVER RECURSÃO INFINITA E POLÍTICAS CONFLITANTES

-- 1. LIMPAR COMPLETAMENTE A TABELA USER_ROLES
-- Remover TODAS as políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "users_can_view_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins_can_manage_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- 2. CRIAR POLÍTICAS ULTRA-SIMPLES SEM RECURSÃO
-- Política básica: usuários podem ver suas próprias roles
CREATE POLICY "view_own_roles" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Política básica: qualquer usuário autenticado pode inserir/atualizar suas próprias roles
CREATE POLICY "manage_own_roles" ON public.user_roles
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. LIMPAR POLÍTICAS PROBLEMÁTICAS EM PROFILES
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Manter apenas políticas básicas para profiles
-- (As políticas "Users can view own profile" e "Users can update own profile" já existem e funcionam)

-- 4. SIMPLIFICAR OUTRAS TABELAS PROBLEMÁTICAS
-- Remover políticas complexas que podem estar causando problemas

-- GAME_SETTINGS: Permitir leitura para todos, escrita apenas para service_role
DROP POLICY IF EXISTS "Admins can manage game settings" ON public.game_settings;
DROP POLICY IF EXISTS "All users can read game settings" ON public.game_settings;

CREATE POLICY "read_game_settings" ON public.game_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- ADMIN_ACTIONS: Simplificar drasticamente
DROP POLICY IF EXISTS "Admins can manage admin actions" ON public.admin_actions;

-- CHALLENGES: Permitir leitura para todos
DROP POLICY IF EXISTS "Admins can manage all challenges" ON public.challenges;
DROP POLICY IF EXISTS "All users can view active challenges" ON public.challenges;

CREATE POLICY "read_active_challenges" ON public.challenges
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 5. WEEKLY_RANKINGS: Manter simples
DROP POLICY IF EXISTS "Users can view weekly rankings" ON public.weekly_rankings;
DROP POLICY IF EXISTS "System and admins can manage weekly rankings" ON public.weekly_rankings;
DROP POLICY IF EXISTS "System can insert weekly rankings" ON public.weekly_rankings;

CREATE POLICY "view_weekly_rankings" ON public.weekly_rankings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "insert_weekly_rankings" ON public.weekly_rankings
  FOR INSERT
  WITH CHECK (true);

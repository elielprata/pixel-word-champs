
-- Primeiro, verificar e habilitar RLS se ainda não estiver habilitado
DO $$ 
BEGIN
    -- Habilitar RLS apenas se não estiver habilitado
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'custom_competitions' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.custom_competitions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Remover políticas conflitantes se existirem e recriar com nomes únicos
DROP POLICY IF EXISTS "Users can view active competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "Users can view all competitions" ON public.custom_competitions;
DROP POLICY IF EXISTS "Admins can manage competitions" ON public.custom_competitions;

-- Criar nova política consolidada para usuários verem competições
CREATE POLICY "authenticated_users_can_view_competitions" ON public.custom_competitions
  FOR SELECT
  TO authenticated
  USING (true);

-- Criar política para admins gerenciarem competições
CREATE POLICY "admins_can_manage_competitions" ON public.custom_competitions
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

-- Garantir que competition_participations tem RLS e políticas corretas
DO $$ 
BEGIN
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'competition_participations' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.competition_participations ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Remover e recriar políticas para competition_participations
DROP POLICY IF EXISTS "Users can view own participations" ON public.competition_participations;
DROP POLICY IF EXISTS "Users can create own participations" ON public.competition_participations;
DROP POLICY IF EXISTS "Admins can view all participations" ON public.competition_participations;

CREATE POLICY "users_own_participations_select" ON public.competition_participations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "users_own_participations_insert" ON public.competition_participations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "admins_all_participations" ON public.competition_participations
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

-- Garantir que game_sessions tem RLS e políticas corretas
DO $$ 
BEGIN
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'game_sessions' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Remover e recriar políticas para game_sessions se necessário
DROP POLICY IF EXISTS "Users can view own sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "Users can create own sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.game_sessions;

CREATE POLICY "users_own_sessions_select" ON public.game_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "users_own_sessions_insert" ON public.game_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_own_sessions_update" ON public.game_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

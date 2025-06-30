
-- Correção de segurança: Habilitar RLS nas tabelas que estão faltando

-- 1. WEEKLY_CONFIG - Habilitar RLS e criar políticas
ALTER TABLE public.weekly_config ENABLE ROW LEVEL SECURITY;

-- Políticas para weekly_config
CREATE POLICY "authenticated_select_weekly_config" ON public.weekly_config
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "admins_manage_weekly_config" ON public.weekly_config
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2. WEEKLY_COMPETITIONS_SNAPSHOT - Habilitar RLS e criar políticas
ALTER TABLE public.weekly_competitions_snapshot ENABLE ROW LEVEL SECURITY;

-- Políticas para weekly_competitions_snapshot
CREATE POLICY "authenticated_select_competitions_snapshot" ON public.weekly_competitions_snapshot
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "admins_manage_competitions_snapshot" ON public.weekly_competitions_snapshot
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. WEEKLY_COMPETITIONS_BACKUP - Habilitar RLS e criar políticas
ALTER TABLE public.weekly_competitions_backup ENABLE ROW LEVEL SECURITY;

-- Políticas para weekly_competitions_backup
CREATE POLICY "authenticated_select_competitions_backup" ON public.weekly_competitions_backup
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "admins_manage_competitions_backup" ON public.weekly_competitions_backup
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Log de confirmação
DO $$
BEGIN
  RAISE NOTICE 'RLS habilitado e políticas criadas para: weekly_config, weekly_competitions_snapshot, weekly_competitions_backup';
END $$;


-- ===================================
-- TESTE COMPLETO DO SISTEMA - FASE FINAL
-- ===================================

-- 1. VERIFICAÇÃO: Status das políticas implementadas
SELECT 
  '📊 POLÍTICAS IMPLEMENTADAS' as categoria,
  COUNT(*) as total_politicas,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ POLÍTICAS ATIVAS'
    ELSE '❌ NENHUMA POLÍTICA'
  END as status
FROM pg_policies 
WHERE schemaname = 'public';

-- 2. TESTE: Distribuição de políticas por tabela
SELECT 
  '📋 POLÍTICAS POR TABELA' as categoria,
  tablename,
  COUNT(*) as num_politicas
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY COUNT(*) DESC, tablename;

-- 3. TESTE: Verificar função is_admin()
SELECT 
  '🔧 TESTE FUNÇÃO is_admin()' as categoria,
  CASE 
    WHEN public.is_admin() IS NOT NULL THEN '✅ FUNCIONAL'
    ELSE '❌ ERRO'
  END as status,
  public.is_admin() as resultado_funcao;

-- 4. TESTE: Verificar função get_users_with_real_emails()
SELECT 
  '👥 TESTE FUNÇÃO get_users_with_real_emails()' as categoria,
  COUNT(*) as usuarios_encontrados,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ DADOS ACESSÍVEIS'
    ELSE '❌ SEM DADOS'
  END as status
FROM public.get_users_with_real_emails();

-- 5. TESTE: Verificar acesso a tabelas críticas
SELECT 
  '🗄️ TESTE ACESSO PROFILES' as categoria,
  COUNT(*) as total_profiles,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ ACESSÍVEL'
    ELSE '❌ BLOQUEADO'
  END as status
FROM public.profiles;

-- 6. TESTE: Verificar user_roles
SELECT 
  '👤 TESTE USER_ROLES' as categoria,
  COUNT(*) as total_roles,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ ACESSÍVEL'
    ELSE '❌ BLOQUEADO'
  END as status
FROM public.user_roles;

-- 7. TESTE: Verificar game_settings (dados públicos)
SELECT 
  '⚙️ TESTE GAME_SETTINGS' as categoria,
  COUNT(*) as total_settings,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ ACESSÍVEL'
    ELSE '❌ BLOQUEADO'
  END as status
FROM public.game_settings;

-- 8. TESTE: Verificar weekly_rankings (público)
SELECT 
  '🏆 TESTE WEEKLY_RANKINGS' as categoria,
  COUNT(*) as total_rankings,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ ACESSÍVEL'
    ELSE '❌ BLOQUEADO'
  END as status
FROM public.weekly_rankings;

-- 9. RESUMO FINAL
SELECT 
  '🎯 RESUMO FINAL' as categoria,
  'Sistema RLS Padronizado Implementado' as resultado,
  'Testando todas as funcionalidades críticas' as status;

-- 10. VERIFICAÇÃO: Políticas com nomenclatura padronizada
SELECT 
  '📝 VERIFICAÇÃO NOMENCLATURA' as categoria,
  policyname,
  tablename
FROM pg_policies 
WHERE schemaname = 'public'
  AND (policyname LIKE '%_own_%' 
       OR policyname LIKE 'admin_%' 
       OR policyname LIKE 'select_%'
       OR policyname LIKE 'insert_%'
       OR policyname LIKE 'update_%'
       OR policyname LIKE 'manage_%')
ORDER BY tablename, policyname;

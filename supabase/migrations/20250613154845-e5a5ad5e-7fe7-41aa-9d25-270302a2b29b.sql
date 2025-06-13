
-- ===================================
-- FASE 2: TESTE DE VERIFICAÇÃO DA LIMPEZA
-- ===================================

-- 1. VERIFICAÇÃO: Contar políticas restantes
SELECT 
  'POLÍTICAS RESTANTES' as tipo_verificacao,
  COUNT(*) as total_politicas,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ LIMPEZA COMPLETA'
    ELSE '❌ AINDA EXISTEM POLÍTICAS'
  END as status
FROM pg_policies 
WHERE schemaname = 'public';

-- 2. VERIFICAÇÃO: Listar tabelas com RLS ativo
SELECT 
  'TABELAS COM RLS ATIVO' as tipo_verificacao,
  schemaname,
  tablename,
  rowsecurity as rls_ativo
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true
ORDER BY tablename;

-- 3. VERIFICAÇÃO: Status das funções críticas
SELECT 
  'FUNÇÕES CRÍTICAS' as tipo_verificacao,
  proname as nome_funcao,
  CASE 
    WHEN proname IS NOT NULL THEN '✅ EXISTE'
    ELSE '❌ NÃO EXISTE'
  END as status
FROM pg_proc 
WHERE proname IN ('is_admin', 'has_role', 'get_users_with_real_emails')
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 4. TESTE: Verificar se a função is_admin() funciona
SELECT 
  'TESTE FUNÇÃO is_admin()' as tipo_verificacao,
  CASE 
    WHEN public.is_admin() IS NOT NULL THEN '✅ FUNCIONAL'
    ELSE '❌ ERRO'
  END as status;

-- 5. VERIFICAÇÃO: Contagem de registros em tabelas críticas
SELECT 
  'CONTAGEM TABELAS CRÍTICAS' as tipo_verificacao,
  'profiles' as tabela,
  COUNT(*) as total_registros
FROM public.profiles
UNION ALL
SELECT 
  'CONTAGEM TABELAS CRÍTICAS',
  'user_roles',
  COUNT(*)
FROM public.user_roles
UNION ALL
SELECT 
  'CONTAGEM TABELAS CRÍTICAS',
  'admin_actions',
  COUNT(*)
FROM public.admin_actions;

-- 6. RESUMO FINAL DA VERIFICAÇÃO
SELECT 
  '🔍 RESUMO DA VERIFICAÇÃO' as resultado,
  'Fase 2 executada - verificar resultados acima' as instrucoes,
  'Se todas as verificações estão OK, prosseguir para Fase 3' as proximo_passo;

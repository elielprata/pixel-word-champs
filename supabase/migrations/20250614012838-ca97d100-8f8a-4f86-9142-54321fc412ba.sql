
-- ===================================
-- VERIFICAÇÃO COMPLETA DO SISTEMA RLS
-- ===================================

-- 1. VERIFICAR POLÍTICAS IMPLEMENTADAS
SELECT 
  '📊 POLÍTICAS POR TABELA' as categoria,
  tablename,
  COUNT(*) as total_politicas,
  STRING_AGG(policyname, ', ' ORDER BY policyname) as politicas
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 2. VERIFICAR TABELAS COM RLS ATIVO
SELECT 
  '🔒 STATUS RLS' as categoria,
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS ATIVO'
    ELSE '❌ RLS INATIVO'
  END as status_rls
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. VERIFICAR POLÍTICAS PROBLEMÁTICAS (weekly_rankings)
SELECT 
  '⚠️ WEEKLY_RANKINGS' as categoria,
  policyname,
  cmd as operacao,
  permissive as tipo,
  CASE 
    WHEN cmd = 'INSERT' THEN '🔍 PODE ESTAR CAUSANDO ERRO'
    ELSE '✅ OK'
  END as status
FROM pg_policies 
WHERE tablename = 'weekly_rankings' AND schemaname = 'public'
ORDER BY cmd;

-- 4. VERIFICAR FUNÇÃO is_admin() 
SELECT 
  '🔧 FUNÇÃO is_admin()' as categoria,
  CASE 
    WHEN proname = 'is_admin' THEN '✅ FUNÇÃO EXISTE'
    ELSE '❌ FUNÇÃO NÃO ENCONTRADA'
  END as status
FROM pg_proc 
WHERE proname = 'is_admin' 
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
LIMIT 1;

-- 5. TESTE RÁPIDO DA FUNÇÃO is_admin()
DO $$
BEGIN
  IF public.is_admin() IS NOT NULL THEN
    RAISE NOTICE '✅ Função is_admin() está funcionando';
  ELSE
    RAISE NOTICE '❌ Função is_admin() com problema';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '🔴 ERRO na função is_admin(): %', SQLERRM;
END $$;

-- 6. VERIFICAR CONSTRAINTS E FOREIGN KEYS PROBLEMÁTICAS
SELECT 
  '🔗 FOREIGN KEYS' as categoria,
  conname as constraint_name,
  conrelid::regclass as tabela,
  confrelid::regclass as tabela_referenciada
FROM pg_constraint 
WHERE contype = 'f' 
  AND conrelid::regclass::text IN ('competition_participations', 'weekly_rankings')
ORDER BY conrelid::regclass;

-- 7. CONTAGEM FINAL DE SEGURANÇA
SELECT 
  '📈 RESUMO FINAL' as resultado,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_politicas,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as tabelas_com_rls,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') >= 40 
    THEN '🎉 IMPLEMENTAÇÃO COMPLETA'
    ELSE '⚠️ IMPLEMENTAÇÃO INCOMPLETA'
  END as status_geral;

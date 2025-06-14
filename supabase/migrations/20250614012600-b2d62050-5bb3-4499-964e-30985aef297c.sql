
-- ===================================
-- VERIFICAÇÃO COMPLETA PÓS-ETAPA 1
-- ===================================

-- 1. VERIFICAÇÃO GERAL: Contar todas as políticas RLS restantes
SELECT 
  '🔍 VERIFICAÇÃO GERAL' as tipo_verificacao,
  COUNT(*) as total_politicas_restantes,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ ETAPA 1 COMPLETA - ZERO POLÍTICAS RESTANTES'
    ELSE '⚠️ AINDA EXISTEM ' || COUNT(*) || ' POLÍTICAS'
  END as status_etapa_1
FROM pg_policies 
WHERE schemaname = 'public';

-- 2. VERIFICAÇÃO ESPECÍFICA: Políticas nas tabelas da ETAPA 1
SELECT 
  '🎯 VERIFICAÇÃO ESPECÍFICA ETAPA 1' as tipo_verificacao,
  tablename,
  COUNT(*) as politicas_por_tabela
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('game_sessions', 'invites', 'user_roles', 'word_categories')
GROUP BY tablename
ORDER BY tablename;

-- 3. LISTAGEM DETALHADA: Todas as políticas restantes (se existirem)
SELECT 
  '📋 POLÍTICAS RESTANTES' as tipo_verificacao,
  tablename,
  policyname,
  cmd as operacao,
  permissive as tipo_politica
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. VERIFICAÇÃO DE TABELAS COM RLS ATIVO
SELECT 
  '🔒 TABELAS COM RLS ATIVO' as tipo_verificacao,
  tablename,
  rowsecurity as rls_ativo
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true
ORDER BY tablename;

-- 5. RESUMO FINAL DA SITUAÇÃO
SELECT 
  '📊 RESUMO FINAL' as resultado,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') = 0 
    THEN '✅ ETAPA 1 FINALIZADA - PRONTO PARA ETAPA 2'
    ELSE '❌ ETAPA 1 INCOMPLETA - REVISAR POLÍTICAS RESTANTES'
  END as status_geral,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_politicas,
  'Analisar resultados acima para próximos passos' as instrucoes;

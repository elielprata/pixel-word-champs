
-- ===================================
-- VERIFICAÇÃO ESPECÍFICA DA FASE 1
-- ===================================

-- Teste direto: Contar exatamente quantas políticas RLS ainda existem
SELECT 
  '🧹 FASE 1 - STATUS DA LIMPEZA' as verificacao,
  COUNT(*) as politicas_restantes,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ FASE 1 COMPLETA - LIMPEZA 100% SUCESSO'
    WHEN COUNT(*) > 0 THEN '❌ FASE 1 INCOMPLETA - AINDA EXISTEM ' || COUNT(*) || ' POLÍTICAS'
  END as resultado
FROM pg_policies 
WHERE schemaname = 'public';

-- Se ainda existem políticas, listar quais são (máximo 20)
SELECT 
  '📋 POLÍTICAS RESTANTES' as tipo,
  schemaname || '.' || tablename || '.' || policyname as politica_completa
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname
LIMIT 20;

-- Verificar se as tabelas ainda têm RLS ativo
SELECT 
  '🔒 TABELAS COM RLS' as tipo,
  tablename,
  CASE 
    WHEN rowsecurity = true THEN 'RLS ATIVO'
    ELSE 'RLS INATIVO'
  END as status_rls
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true
ORDER BY tablename;


-- ===================================
-- DIAGNÓSTICO DETALHADO DE PROBLEMAS RLS
-- ===================================

-- 1. VERIFICAR POLÍTICAS CONFLITANTES EM WEEKLY_RANKINGS
SELECT 
  '🔍 WEEKLY_RANKINGS - POLÍTICAS DETALHADAS' as categoria,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'weekly_rankings' AND schemaname = 'public'
ORDER BY cmd, policyname;

-- 2. VERIFICAR SE A FUNÇÃO update_weekly_ranking ESTÁ FUNCIONANDO
DO $$
BEGIN
  -- Testar se a função existe e pode ser executada
  PERFORM public.update_weekly_ranking();
  RAISE NOTICE '✅ Função update_weekly_ranking executada com sucesso';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO na função update_weekly_ranking: %', SQLERRM;
END $$;

-- 3. VERIFICAR USUÁRIOS SEM PERFIL (pode causar problemas)
SELECT 
  '👤 USUÁRIOS SEM PERFIL' as categoria,
  COUNT(au.id) as usuarios_sem_perfil,
  CASE 
    WHEN COUNT(au.id) = 0 THEN '✅ TODOS OS USUÁRIOS TÊM PERFIL'
    ELSE '⚠️ USUÁRIOS SEM PERFIL ENCONTRADOS'
  END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 4. VERIFICAR COMPETITION_PARTICIPATIONS - FOREIGN KEY ISSUES
SELECT 
  '🏆 PARTICIPAÇÕES ÓRFÃS' as categoria,
  COUNT(cp.id) as participacoes_orfas,
  CASE 
    WHEN COUNT(cp.id) = 0 THEN '✅ TODAS AS PARTICIPAÇÕES VÁLIDAS'
    ELSE '⚠️ PARTICIPAÇÕES COM COMPETITION_ID INVÁLIDO'
  END as status
FROM public.competition_participations cp
LEFT JOIN public.custom_competitions cc ON cp.competition_id = cc.id
WHERE cc.id IS NULL AND cp.competition_id IS NOT NULL;

-- 5. VERIFICAR CONFLITOS DE POLÍTICAS RLS
SELECT 
  '⚠️ POSSÍVEIS CONFLITOS' as categoria,
  tablename,
  COUNT(CASE WHEN cmd = 'ALL' THEN 1 END) as politicas_all,
  COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as politicas_insert,
  COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as politicas_select,
  CASE 
    WHEN COUNT(CASE WHEN cmd = 'ALL' THEN 1 END) > 0 AND 
         (COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) > 0 OR COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) > 0)
    THEN '⚠️ POSSÍVEL CONFLITO'
    ELSE '✅ SEM CONFLITOS'
  END as status_conflito
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
HAVING COUNT(CASE WHEN cmd = 'ALL' THEN 1 END) > 0 AND 
       (COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) > 0 OR COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) > 0)
ORDER BY tablename;

-- 6. VERIFICAR USUÁRIOS ADMIN EXISTENTES
SELECT 
  '👑 USUÁRIOS ADMIN' as categoria,
  COUNT(ur.user_id) as total_admins,
  CASE 
    WHEN COUNT(ur.user_id) = 0 THEN '❌ NENHUM ADMIN ENCONTRADO'
    WHEN COUNT(ur.user_id) = 1 THEN '✅ UM ADMIN CONFIGURADO'
    ELSE '✅ ' || COUNT(ur.user_id) || ' ADMINS CONFIGURADOS'
  END as status
FROM public.user_roles ur
WHERE ur.role = 'admin';

-- 7. TESTE ESPECÍFICO DE INSERÇÃO EM WEEKLY_RANKINGS
SELECT 
  '🧪 TESTE INSERT WEEKLY_RANKINGS' as categoria,
  'Verificando se é possível inserir dados como sistema' as descricao;

-- Verificar se conseguimos inserir um registro de teste (será removido depois)
DO $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Pegar um usuário existente para teste
  SELECT id INTO test_user_id FROM public.profiles LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Tentar inserir um registro de teste
    INSERT INTO public.weekly_rankings (
      user_id, week_start, week_end, position, total_score, username
    ) VALUES (
      test_user_id, 
      CURRENT_DATE, 
      CURRENT_DATE + 6, 
      999, 
      0, 
      'TESTE'
    );
    
    -- Remover o registro de teste imediatamente
    DELETE FROM public.weekly_rankings WHERE position = 999 AND username = 'TESTE';
    
    RAISE NOTICE '✅ INSERT em weekly_rankings funcionando normalmente';
  ELSE
    RAISE NOTICE '❌ Nenhum usuário encontrado para teste';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO no teste de INSERT: %', SQLERRM;
END $$;

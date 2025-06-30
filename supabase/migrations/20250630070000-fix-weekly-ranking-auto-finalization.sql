
-- CORREÇÃO DO SISTEMA DE FINALIZAÇÃO AUTOMÁTICA DE RANKINGS SEMANAIS
-- Configurar cron job para 23:59 diariamente e melhorar sistema de detecção

-- ===================================
-- FASE 1: CONFIGURAR CRON JOB PARA FINALIZAÇÃO AUTOMÁTICA
-- ===================================

-- Remover jobs existentes relacionados à finalização semanal
SELECT cron.unschedule('weekly-competition-finalizer-daily') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'weekly-competition-finalizer-daily'
);

-- Criar cron job para executar diariamente às 23:59
SELECT cron.schedule(
  'weekly-competition-finalizer-daily',
  '59 23 * * *', -- Às 23:59 todos os dias
  $$
  SELECT
    net.http_post(
      url := 'https://oqzpkqbmcnpxpegshlcm.supabase.co/functions/v1/weekly-competition-finalizer',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
      body := '{"scheduled_execution": true}'::jsonb
    ) as request_id;
  $$
);

-- ===================================
-- FASE 2: MELHORAR DETECÇÃO DE STATUS DAS COMPETIÇÕES
-- ===================================

-- Função para verificar e atualizar status automaticamente
CREATE OR REPLACE FUNCTION public.check_weekly_competitions_status()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_date_local DATE;
  updated_count INTEGER := 0;
  competitions_to_finalize jsonb := '[]'::jsonb;
  comp_record RECORD;
BEGIN
  current_date_local := CURRENT_DATE;
  
  RAISE NOTICE '🔍 Verificando status de competições semanais para data: %', current_date_local;
  
  -- Buscar competições que deveriam ter sido finalizadas
  FOR comp_record IN 
    SELECT id, start_date, end_date, status, title
    FROM weekly_config 
    WHERE status = 'active' 
      AND end_date < current_date_local -- Passou da data de fim
  LOOP
    -- Marcar como 'ended' (pronta para finalização)
    UPDATE weekly_config 
    SET 
      status = 'ended',
      updated_at = NOW()
    WHERE id = comp_record.id;
    
    updated_count := updated_count + 1;
    
    -- Adicionar aos resultados
    competitions_to_finalize := competitions_to_finalize || jsonb_build_object(
      'id', comp_record.id,
      'title', comp_record.title,
      'end_date', comp_record.end_date,
      'days_overdue', current_date_local - comp_record.end_date,
      'needs_finalization', true
    );
    
    RAISE NOTICE '⚠️ Competição % ("%") deveria ter sido finalizada em % (% dias atrás)', 
      comp_record.id, comp_record.title, comp_record.end_date, 
      current_date_local - comp_record.end_date;
  END LOOP;
  
  RAISE NOTICE '✅ Verificação concluída: % competições marcadas para finalização', updated_count;
  
  RETURN jsonb_build_object(
    'success', true,
    'checked_at', NOW(),
    'current_date', current_date_local,
    'competitions_needing_finalization', updated_count,
    'competitions_details', competitions_to_finalize
  );
END;
$function$;

-- ===================================
-- FASE 3: MELHORAR EDGE FUNCTION DE FINALIZAÇÃO
-- ===================================

-- Função para log de automação
CREATE OR REPLACE FUNCTION public.log_weekly_finalization_attempt(
  competition_id uuid,
  success boolean,
  error_message text DEFAULT NULL,
  execution_details jsonb DEFAULT NULL
)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO automation_logs (
    automation_type,
    scheduled_time,
    executed_at,
    execution_status,
    affected_users,
    settings_snapshot,
    error_details,
    metadata
  ) VALUES (
    'weekly_competition_finalization',
    NOW(),
    NOW(),
    CASE WHEN success THEN 'success' ELSE 'error' END,
    0, -- Será atualizado após finalização
    jsonb_build_object(
      'competition_id', competition_id,
      'finalization_type', 'automatic',
      'trigger', 'cron_job'
    ),
    CASE WHEN NOT success THEN error_message ELSE NULL END,
    COALESCE(execution_details, '{}'::jsonb)
  );
  
  RAISE NOTICE '📝 Log de finalização automática registrado para competição %', competition_id;
END;
$function$;

-- ===================================
-- FASE 4: EXECUTAR VERIFICAÇÃO INICIAL
-- ===================================

-- Executar verificação imediata para identificar problemas atuais
SELECT public.check_weekly_competitions_status();

-- ===================================
-- FASE 5: LOGS E VALIDAÇÃO
-- ===================================

DO $$
BEGIN
  RAISE NOTICE '🎯 SISTEMA DE FINALIZAÇÃO AUTOMÁTICA CONFIGURADO!';
  RAISE NOTICE '⏰ Cron job configurado para 23:59 diariamente';
  RAISE NOTICE '🔍 Sistema de detecção de status melhorado';
  RAISE NOTICE '📝 Sistema de logs implementado';
  RAISE NOTICE '✅ Competições vencidas serão finalizadas automaticamente';
  RAISE NOTICE '';
  RAISE NOTICE '📋 PRÓXIMOS PASSOS:';
  RAISE NOTICE '1. Verificar se há competições pendentes de finalização';
  RAISE NOTICE '2. Executar finalização manual se necessário';
  RAISE NOTICE '3. Monitorar logs de automação';
  RAISE NOTICE '4. Verificar execução do cron job às 23:59';
END $$;

-- Verificar jobs ativos
SELECT 
  jobid, 
  jobname, 
  schedule, 
  active,
  database
FROM cron.job 
WHERE jobname LIKE '%weekly%' OR jobname LIKE '%finalizer%'
ORDER BY jobname;



-- FASE 1: Corrigir lógica base - Criar função para verificar se deve resetar ranking
CREATE OR REPLACE FUNCTION public.should_reset_weekly_ranking()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  config_record RECORD;
  week_start_date DATE;
  week_end_date DATE;
  should_reset BOOLEAN := false;
  reset_info jsonb;
BEGIN
  -- Buscar configuração ativa
  SELECT * INTO config_record 
  FROM weekly_config 
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Se não houver configuração, usar padrão (domingo a sábado)
  IF config_record IS NULL THEN
    config_record.start_day_of_week := 0;
    config_record.duration_days := 7;
    config_record.custom_start_date := NULL;
    config_record.custom_end_date := NULL;
  END IF;
  
  -- PRIORIZAR datas customizadas se existirem
  IF config_record.custom_start_date IS NOT NULL AND config_record.custom_end_date IS NOT NULL THEN
    -- Usar datas específicas configuradas pelo usuário
    week_start_date := config_record.custom_start_date;
    week_end_date := config_record.custom_end_date;
    
    -- Verificar se passou da data de fim (deve resetar no dia seguinte às 00:00:00)
    should_reset := current_date > week_end_date;
  ELSE
    -- Calcular baseado no dia da semana
    week_start_date := current_date - EXTRACT(DOW FROM current_date)::integer;
    
    -- Se configuração personalizada de dia inicial
    IF config_record.start_day_of_week != 0 THEN
      week_start_date := current_date - 
        ((EXTRACT(DOW FROM current_date)::integer - config_record.start_day_of_week + 7) % 7);
    END IF;
    
    week_end_date := week_start_date + (config_record.duration_days - 1);
    
    -- Para datas calculadas, verificar se passou do período
    should_reset := current_date > week_end_date;
  END IF;
  
  -- Compilar informações do reset
  SELECT jsonb_build_object(
    'should_reset', should_reset,
    'current_date', current_date,
    'week_start', week_start_date,
    'week_end', week_end_date,
    'next_reset_date', week_end_date + 1,
    'is_custom_dates', (config_record.custom_start_date IS NOT NULL AND config_record.custom_end_date IS NOT NULL),
    'config', jsonb_build_object(
      'start_day_of_week', config_record.start_day_of_week,
      'duration_days', config_record.duration_days,
      'custom_start_date', config_record.custom_start_date,
      'custom_end_date', config_record.custom_end_date
    )
  ) INTO reset_info;
  
  RETURN reset_info;
END;
$function$;

-- FASE 2: Criar cron job diário para verificar reset automático às 00:00:00
SELECT cron.schedule(
  'daily-weekly-ranking-reset-check',
  '0 0 * * *', -- Diariamente às 00:00:00
  $$
  SELECT
    net.http_post(
        url:='https://oqzpkqbmcnpxpegshlcm.supabase.co/functions/v1/automation-reset-checker',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xenBrcWJtY25weHBlZ3NobGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDY5MzcsImV4cCI6MjA2NDcyMjkzN30.Wla6j2fBOnPd0DbNmVIdhZKfkTp09d9sE8NOULcRsQk"}'::jsonb,
        body:='{"time_based_check": true, "trigger_type": "time_based"}'::jsonb
    ) as request_id;
  $$
);

-- Remover configurações antigas de automação que usavam competition_finalization
UPDATE game_settings 
SET setting_value = jsonb_set(
  setting_value::jsonb, 
  '{triggerType}', 
  '"time_based"'
)
WHERE setting_key = 'reset_automation_config'
  AND setting_value::jsonb->>'triggerType' = 'competition_finalization';

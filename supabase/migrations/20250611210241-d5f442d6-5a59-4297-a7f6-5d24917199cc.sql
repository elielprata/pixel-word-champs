

-- Corrigir apenas as funções com search_path mutável para segurança
-- (A extensão pg_net precisa permanecer no schema public)

-- 1. Atualizar função update_competition_status
CREATE OR REPLACE FUNCTION public.update_competition_status()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  brasilia_now TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Obter o horário atual de Brasília (UTC-3)
  brasilia_now := NOW() AT TIME ZONE 'America/Sao_Paulo';
  
  -- Finalizar competições que passaram da data de fim
  UPDATE custom_competitions 
  SET status = 'completed', updated_at = NOW()
  WHERE competition_type = 'tournament' 
    AND status = 'active'
    AND end_date AT TIME ZONE 'America/Sao_Paulo' < brasilia_now;
  
  -- Ativar competições agendadas que chegaram na data de início
  UPDATE custom_competitions 
  SET status = 'active', updated_at = NOW()
  WHERE competition_type = 'tournament' 
    AND status = 'scheduled'
    AND start_date AT TIME ZONE 'America/Sao_Paulo' <= brasilia_now
    AND end_date AT TIME ZONE 'America/Sao_Paulo' > brasilia_now;
  
  -- Garantir que competições futuras fiquem como agendadas
  UPDATE custom_competitions 
  SET status = 'scheduled', updated_at = NOW()
  WHERE competition_type = 'tournament' 
    AND status = 'active'
    AND start_date AT TIME ZONE 'America/Sao_Paulo' > brasilia_now;
    
  -- Log da execução
  RAISE NOTICE 'Competition status updated at %', brasilia_now;
END;
$function$;

-- 2. Atualizar função update_daily_ranking
CREATE OR REPLACE FUNCTION public.update_daily_ranking()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Esta função pode ser implementada conforme necessário
  -- Por enquanto, apenas um placeholder
  RAISE NOTICE 'Daily ranking update function called';
END;
$function$;

-- 3. Atualizar função handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;


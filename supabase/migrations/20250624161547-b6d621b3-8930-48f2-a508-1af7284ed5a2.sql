
-- Criar tabela para configuração do período semanal
CREATE TABLE public.weekly_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  start_day_of_week integer NOT NULL DEFAULT 0, -- 0=Domingo, 1=Segunda, etc.
  duration_days integer NOT NULL DEFAULT 7,
  custom_start_date date NULL,
  custom_end_date date NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Inserir configuração padrão (Domingo a Sábado - atual)
INSERT INTO public.weekly_config (start_day_of_week, duration_days, is_active)
VALUES (0, 7, true);

-- Trigger para updated_at
CREATE TRIGGER handle_weekly_config_updated_at 
  BEFORE UPDATE ON public.weekly_config 
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_updated_at();

-- Atualizar função get_weekly_ranking_stats para usar configuração personalizada
CREATE OR REPLACE FUNCTION public.get_weekly_ranking_stats()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_week_start date;
  current_week_end date;
  config_record RECORD;
  stats jsonb;
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
  
  -- Calcular período baseado na configuração
  IF config_record.custom_start_date IS NOT NULL AND config_record.custom_end_date IS NOT NULL THEN
    -- Usar datas específicas
    current_week_start := config_record.custom_start_date;
    current_week_end := config_record.custom_end_date;
  ELSE
    -- Calcular baseado no dia da semana e duração
    current_week_start := date_trunc('week', current_date)::date + (config_record.start_day_of_week || ' days')::interval;
    
    -- Ajustar se a semana calculada está no futuro
    IF current_week_start > current_date THEN
      current_week_start := current_week_start - interval '7 days';
    END IF;
    
    current_week_end := current_week_start + (config_record.duration_days - 1 || ' days')::interval;
  END IF;
  
  -- Compilar estatísticas
  SELECT jsonb_build_object(
    'current_week_start', current_week_start,
    'current_week_end', current_week_end,
    'config', jsonb_build_object(
      'start_day_of_week', config_record.start_day_of_week,
      'duration_days', config_record.duration_days,
      'custom_start_date', config_record.custom_start_date,
      'custom_end_date', config_record.custom_end_date
    ),
    'total_participants', (
      SELECT count(*) FROM profiles WHERE total_score > 0
    ),
    'total_prize_pool', (
      SELECT COALESCE(sum(prize_amount), 0) FROM weekly_rankings 
      WHERE week_start = current_week_start
    ),
    'last_update', (
      SELECT COALESCE(max(updated_at), now()) FROM weekly_rankings 
      WHERE week_start = current_week_start
    ),
    'top_3_players', (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'username', username,
            'score', total_score,
            'position', position,
            'prize', prize_amount
          ) ORDER BY position
        ), 
        '[]'::jsonb
      )
      FROM weekly_rankings 
      WHERE week_start = current_week_start 
        AND position <= 3
    )
  ) INTO stats;
  
  RETURN stats;
END;
$function$

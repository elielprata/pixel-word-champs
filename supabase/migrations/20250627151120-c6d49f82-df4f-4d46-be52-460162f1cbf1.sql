
-- Atualizar a função get_weekly_ranking_stats para lidar com cenários sem configuração ativa
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
  calculated_prize_pool numeric := 0;
BEGIN
  -- Buscar configuração ativa primeiro
  SELECT * INTO config_record 
  FROM weekly_config 
  WHERE status = 'active' 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Se não houver configuração ativa, buscar a última finalizada
  IF config_record IS NULL THEN
    SELECT * INTO config_record 
    FROM weekly_config 
    WHERE status = 'completed' 
    ORDER BY completed_at DESC 
    LIMIT 1;
  END IF;
  
  -- Se ainda não houver configuração, retornar estado sem competição
  IF config_record IS NULL THEN
    RETURN jsonb_build_object(
      'current_week_start', null,
      'current_week_end', null,
      'config', null,
      'total_participants', 0,
      'total_prize_pool', 0,
      'last_update', now(),
      'top_3_players', '[]'::jsonb,
      'no_active_competition', true,
      'message', 'Nenhuma competição configurada'
    );
  END IF;
  
  -- Usar as datas configuradas
  current_week_start := config_record.start_date;
  current_week_end := config_record.end_date;
  
  -- Calcular pool de prêmios baseado nas configurações ativas
  SELECT COALESCE(SUM(
    CASE 
      WHEN pc.type = 'individual' THEN pc.prize_amount
      WHEN pc.type = 'group' THEN pc.prize_amount * pc.total_winners
      ELSE 0
    END
  ), 0) INTO calculated_prize_pool
  FROM prize_configurations pc
  WHERE pc.active = true;
  
  -- Compilar estatísticas
  SELECT jsonb_build_object(
    'current_week_start', current_week_start,
    'current_week_end', current_week_end,
    'config', jsonb_build_object(
      'start_date', config_record.start_date,
      'end_date', config_record.end_date,
      'status', config_record.status
    ),
    'total_participants', (
      SELECT count(*) FROM profiles WHERE total_score > 0
    ),
    'total_prize_pool', calculated_prize_pool,
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
    ),
    'no_active_competition', config_record.status != 'active',
    'competition_status', config_record.status
  ) INTO stats;
  
  RETURN stats;
END;
$function$

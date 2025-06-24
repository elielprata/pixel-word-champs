
-- Corrigir a função get_weekly_ranking_stats para resolver o erro de GROUP BY
CREATE OR REPLACE FUNCTION public.get_weekly_ranking_stats()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_week_start date;
  current_week_end date;
  stats jsonb;
BEGIN
  -- Calcular semana atual
  current_week_start := date_trunc('week', current_date)::date;
  current_week_end := current_week_start + interval '6 days';
  
  -- Compilar estatísticas
  SELECT jsonb_build_object(
    'current_week_start', current_week_start,
    'current_week_end', current_week_end,
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

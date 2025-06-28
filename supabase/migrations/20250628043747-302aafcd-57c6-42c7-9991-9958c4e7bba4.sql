
-- Criar função consolidada para estatísticas da competição mensal
-- Seguindo o padrão de get_weekly_ranking_stats()
CREATE OR REPLACE FUNCTION public.get_monthly_invite_stats(target_month text DEFAULT to_char(current_date, 'YYYY-MM'))
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  competition_record RECORD;
  stats jsonb;
  calculated_prize_pool numeric := 0;
  total_participants integer := 0;
  rankings_data jsonb;
BEGIN
  -- Primeiro, garantir que os dados estão atualizados
  PERFORM populate_monthly_competition_and_points(target_month);
  PERFORM populate_monthly_invite_ranking(target_month);
  
  -- Buscar competição do mês
  SELECT * INTO competition_record 
  FROM monthly_invite_competitions 
  WHERE month_year = target_month;
  
  -- Se não houver competição, retornar estado sem competição
  IF competition_record IS NULL THEN
    RETURN jsonb_build_object(
      'competition', null,
      'rankings', '[]'::jsonb,
      'stats', jsonb_build_object(
        'totalParticipants', 0,
        'totalPrizePool', 0,
        'topPerformers', '[]'::jsonb
      ),
      'no_active_competition', true,
      'message', 'Nenhuma competição configurada para este mês'
    );
  END IF;
  
  -- Buscar dados do ranking
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'user_id', user_id,
      'username', username,
      'position', position,
      'invite_points', invite_points,
      'invites_count', invites_count,
      'active_invites_count', active_invites_count,
      'prize_amount', prize_amount,
      'payment_status', payment_status,
      'pix_key', pix_key,
      'pix_holder_name', pix_holder_name
    ) ORDER BY position ASC
  ) INTO rankings_data
  FROM monthly_invite_rankings
  WHERE competition_id = competition_record.id;
  
  -- Calcular estatísticas
  SELECT 
    COUNT(*),
    COALESCE(SUM(prize_amount), 0)
  INTO total_participants, calculated_prize_pool
  FROM monthly_invite_rankings
  WHERE competition_id = competition_record.id;
  
  -- Atualizar total_prize_pool na competição se necessário
  IF competition_record.total_prize_pool != calculated_prize_pool THEN
    UPDATE monthly_invite_competitions
    SET total_prize_pool = calculated_prize_pool
    WHERE id = competition_record.id;
    
    -- Atualizar record local
    competition_record.total_prize_pool := calculated_prize_pool;
  END IF;
  
  -- Compilar resposta final
  SELECT jsonb_build_object(
    'competition', jsonb_build_object(
      'id', competition_record.id,
      'month_year', competition_record.month_year,
      'title', competition_record.title,
      'description', competition_record.description,
      'start_date', competition_record.start_date,
      'end_date', competition_record.end_date,
      'status', competition_record.status,
      'total_participants', total_participants,
      'total_prize_pool', calculated_prize_pool,
      'created_at', competition_record.created_at,
      'updated_at', competition_record.updated_at
    ),
    'rankings', COALESCE(rankings_data, '[]'::jsonb),
    'stats', jsonb_build_object(
      'totalParticipants', total_participants,
      'totalPrizePool', calculated_prize_pool,
      'topPerformers', (
        SELECT COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'username', username,
              'invite_points', invite_points,
              'position', position,
              'prize_amount', prize_amount
            ) ORDER BY position
          ),
          '[]'::jsonb
        )
        FROM monthly_invite_rankings
        WHERE competition_id = competition_record.id
          AND position <= 3
      )
    ),
    'no_active_competition', false,
    'last_update', NOW()
  ) INTO stats;
  
  RETURN stats;
END;
$$;

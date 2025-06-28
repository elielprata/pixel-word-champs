
-- Substituir a função complexa por uma versão simplificada
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
  -- Buscar ou criar competição do mês
  SELECT * INTO competition_record 
  FROM monthly_invite_competitions 
  WHERE month_year = target_month;
  
  -- Se não houver competição, criar uma automaticamente
  IF competition_record IS NULL THEN
    INSERT INTO monthly_invite_competitions (
      month_year,
      title,
      description,
      start_date,
      end_date,
      status
    ) VALUES (
      target_month,
      'Competição de Indicações - ' || to_char(to_date(target_month, 'YYYY-MM'), 'Month YYYY'),
      'Competição mensal baseada em indicações de novos usuários',
      (target_month || '-01')::date,
      (date_trunc('month', (target_month || '-01')::date) + interval '1 month - 1 day')::date,
      CASE 
        WHEN target_month = to_char(current_date, 'YYYY-MM') THEN 'active'
        WHEN target_month < to_char(current_date, 'YYYY-MM') THEN 'completed'
        ELSE 'scheduled'
      END
    ) RETURNING * INTO competition_record;
  END IF;
  
  -- Calcular ranking dinamicamente baseado nos convites reais
  WITH monthly_invites AS (
    SELECT 
      p.id as user_id,
      p.username,
      p.pix_key,
      p.pix_holder_name,
      COUNT(i.id) as invites_count,
      COUNT(CASE WHEN invited_p.games_played > 0 THEN 1 END) as active_invites_count,
      -- Pontos: 10 por convite + 40 bonus por convite ativo
      (COUNT(i.id) * 10 + COUNT(CASE WHEN invited_p.games_played > 0 THEN 1 END) * 40) as invite_points
    FROM profiles p
    LEFT JOIN invites i ON i.invited_by = p.id 
      AND i.created_at >= competition_record.start_date::timestamp
      AND i.created_at <= (competition_record.end_date + interval '1 day')::timestamp
      AND i.used_by IS NOT NULL
    LEFT JOIN profiles invited_p ON invited_p.id = i.used_by
    WHERE p.username IS NOT NULL
    GROUP BY p.id, p.username, p.pix_key, p.pix_holder_name
    HAVING COUNT(i.id) > 0 OR COUNT(CASE WHEN invited_p.games_played > 0 THEN 1 END) > 0
  ),
  ranked_users AS (
    SELECT 
      *,
      ROW_NUMBER() OVER (ORDER BY invite_points DESC, active_invites_count DESC, invites_count DESC) as position
    FROM monthly_invites
  ),
  users_with_prizes AS (
    SELECT 
      ru.*,
      COALESCE(mip.prize_amount, 0) as prize_amount,
      CASE 
        WHEN COALESCE(mip.prize_amount, 0) > 0 THEN 'pending'
        ELSE 'not_eligible'
      END as payment_status
    FROM ranked_users ru
    LEFT JOIN monthly_invite_prizes mip ON mip.competition_id = competition_record.id 
      AND mip.position = ru.position 
      AND mip.active = true
  )
  SELECT jsonb_agg(
    jsonb_build_object(
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
  FROM users_with_prizes;
  
  -- Calcular estatísticas
  SELECT 
    COUNT(*),
    COALESCE(SUM(prize_amount), 0)
  INTO total_participants, calculated_prize_pool
  FROM users_with_prizes;
  
  -- Atualizar total_prize_pool na competição
  UPDATE monthly_invite_competitions
  SET 
    total_prize_pool = calculated_prize_pool,
    total_participants = total_participants,
    updated_at = NOW()
  WHERE id = competition_record.id;
  
  -- Atualizar record local
  competition_record.total_prize_pool := calculated_prize_pool;
  competition_record.total_participants := total_participants;
  
  -- Se não há participantes, retornar estado sem competição ativa
  IF total_participants = 0 THEN
    RETURN jsonb_build_object(
      'competition', jsonb_build_object(
        'id', competition_record.id,
        'month_year', competition_record.month_year,
        'title', competition_record.title,
        'description', competition_record.description,
        'start_date', competition_record.start_date,
        'end_date', competition_record.end_date,
        'status', competition_record.status,
        'total_participants', 0,
        'total_prize_pool', 0,
        'created_at', competition_record.created_at,
        'updated_at', competition_record.updated_at
      ),
      'rankings', '[]'::jsonb,
      'stats', jsonb_build_object(
        'totalParticipants', 0,
        'totalPrizePool', 0,
        'topPerformers', '[]'::jsonb
      ),
      'no_active_competition', true,
      'message', 'Nenhum participante encontrado para este mês'
    );
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
        FROM users_with_prizes
        WHERE position <= 3
      )
    ),
    'no_active_competition', false,
    'last_update', NOW()
  ) INTO stats;
  
  RETURN stats;
END;
$$;

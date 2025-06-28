
-- Melhorar a função RPC get_invite_data_optimized para incluir todos os dados necessários
CREATE OR REPLACE FUNCTION public.get_invite_data_optimized(user_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
  invite_code_val TEXT;
  invited_friends_data JSON;
  stats_data JSON;
  current_month TEXT;
BEGIN
  current_month := to_char(current_date, 'YYYY-MM');
  
  -- Buscar código de convite do usuário
  SELECT code INTO invite_code_val
  FROM invites 
  WHERE invited_by = user_uuid AND is_active = true
  LIMIT 1;

  -- Buscar amigos convidados com dados completos dos perfis
  SELECT COALESCE(JSON_AGG(
    JSON_BUILD_OBJECT(
      'name', COALESCE(p.username, 'Usuário'),
      'status', CASE WHEN p.games_played > 0 THEN 'Ativo' ELSE 'Pendente' END,
      'reward', CASE 
        WHEN p.games_played > 0 THEN 50 
        ELSE 0 
      END,
      'level', GREATEST(1, FLOOR(COALESCE(p.total_score, 0) / 1000) + 1),
      'avatar_url', p.avatar_url,
      'total_score', COALESCE(p.total_score, 0),
      'games_played', COALESCE(p.games_played, 0),
      'invited_at', i.created_at,
      'activated_at', CASE WHEN p.games_played > 0 THEN i.used_at ELSE NULL END
    ) ORDER BY i.created_at DESC
  ), '[]'::JSON) INTO invited_friends_data
  FROM invites i
  LEFT JOIN profiles p ON i.used_by = p.id
  WHERE i.invited_by = user_uuid AND i.used_by IS NOT NULL;

  -- Calcular estatísticas detalhadas
  WITH invite_stats AS (
    SELECT 
      -- Total de pontos baseado em rewards reais processados
      COALESCE(SUM(
        CASE 
          WHEN p.games_played > 0 THEN 50  -- 50 pontos por amigo ativo
          ELSE 10                         -- 10 pontos por convite básico
        END
      ), 0) as total_points,
      -- Contar amigos ativos (que jogaram pelo menos 1 jogo)
      COUNT(CASE WHEN p.games_played > 0 THEN 1 END) as active_friends,
      -- Total de convites aceitos
      COUNT(i.used_by) as total_invites,
      -- Pontos mensais para ranking
      COALESCE(SUM(
        CASE 
          WHEN i.created_at >= date_trunc('month', current_date) THEN
            CASE 
              WHEN p.games_played > 0 THEN 50
              ELSE 10
            END
          ELSE 0
        END
      ), 0) as monthly_points
    FROM invites i
    LEFT JOIN profiles p ON i.used_by = p.id
    WHERE i.invited_by = user_uuid AND i.used_by IS NOT NULL
  ),
  user_level_info AS (
    SELECT 
      p.total_score,
      p.experience_points,
      GREATEST(1, FLOOR(COALESCE(p.total_score, 0) / 1000) + 1) as current_level,
      -- Calcular próximo nível
      (FLOOR(COALESCE(p.total_score, 0) / 1000) + 2) as next_level,
      -- Progresso para próximo nível (0-100)
      CASE 
        WHEN COALESCE(p.total_score, 0) = 0 THEN 0
        ELSE ((COALESCE(p.total_score, 0) % 1000) * 100 / 1000)
      END as level_progress
    FROM profiles p
    WHERE p.id = user_uuid
  )
  SELECT JSON_BUILD_OBJECT(
    'totalPoints', ist.total_points,
    'activeFriends', ist.active_friends,
    'totalInvites', ist.total_invites,
    'monthlyPoints', ist.monthly_points,
    'userLevel', uli.current_level,
    'nextLevel', uli.next_level,
    'levelProgress', uli.level_progress,
    'totalScore', uli.total_score,
    'experiencePoints', uli.experience_points
  ) INTO stats_data
  FROM invite_stats ist, user_level_info uli;

  -- Combinar todos os resultados
  SELECT JSON_BUILD_OBJECT(
    'inviteCode', COALESCE(invite_code_val, ''),
    'invitedFriends', invited_friends_data,
    'stats', stats_data
  ) INTO result;

  RETURN result;
END;
$$;

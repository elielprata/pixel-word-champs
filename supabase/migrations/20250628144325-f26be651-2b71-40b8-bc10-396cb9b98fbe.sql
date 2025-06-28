
-- Fase 1: Limpeza e correções de base
-- Remover convites duplicados (manter apenas o mais recente por usuário)
DELETE FROM invites i1 
WHERE EXISTS (
  SELECT 1 FROM invites i2 
  WHERE i2.invited_by = i1.invited_by 
    AND i2.created_at > i1.created_at
    AND i2.is_active = true
);

-- Criar índice único parcial para evitar múltiplos códigos ativos por usuário
CREATE UNIQUE INDEX unique_active_invite_per_user 
ON invites (invited_by) 
WHERE is_active = true;

-- Fase 2: Estrutura do banco - Criar tabela para rastrear dias únicos de atividade
CREATE TABLE user_activity_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

-- Habilitar RLS na nova tabela
ALTER TABLE user_activity_days ENABLE ROW LEVEL SECURITY;

-- Política para que usuários vejam apenas suas próprias atividades
CREATE POLICY "Users can view their own activity days" 
  ON user_activity_days 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para inserção automática
CREATE POLICY "System can insert activity days" 
  ON user_activity_days 
  FOR INSERT 
  WITH CHECK (true);

-- Trigger para registrar atividade automática quando sessão é completada
CREATE OR REPLACE FUNCTION register_user_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Inserir dia de atividade (ignora se já existe)
  INSERT INTO user_activity_days (user_id, activity_date)
  VALUES (NEW.user_id, CURRENT_DATE)
  ON CONFLICT (user_id, activity_date) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Criar trigger na tabela game_sessions
CREATE TRIGGER register_activity_on_completion
  AFTER UPDATE ON game_sessions
  FOR EACH ROW
  WHEN (OLD.is_completed = false AND NEW.is_completed = true)
  EXECUTE FUNCTION register_user_activity();

-- Função para verificar e ativar convites baseado em 5 dias de atividade
CREATE OR REPLACE FUNCTION check_and_activate_invites()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  activated_count INTEGER := 0;
  result jsonb;
BEGIN
  -- Atualizar invite_rewards para 'processed' quando usuário convidado tem 5+ dias de atividade
  WITH users_with_5_days AS (
    SELECT user_id
    FROM user_activity_days
    GROUP BY user_id
    HAVING COUNT(DISTINCT activity_date) >= 5
  ),
  rewards_to_activate AS (
    SELECT ir.id, ir.user_id, ir.invited_user_id
    FROM invite_rewards ir
    JOIN users_with_5_days u5d ON u5d.user_id = ir.invited_user_id
    WHERE ir.status IN ('pending', 'partial')
  )
  UPDATE invite_rewards
  SET 
    status = 'processed',
    reward_amount = 50,
    processed_at = NOW()
  WHERE id IN (SELECT id FROM rewards_to_activate);
  
  GET DIAGNOSTICS activated_count = ROW_COUNT;
  
  -- Também definir status 'partial' para rewards que ainda não foram processados
  UPDATE invite_rewards 
  SET status = 'partial', reward_amount = 5
  WHERE status = 'pending';
  
  RETURN jsonb_build_object(
    'activated_rewards', activated_count,
    'partial_rewards_updated', (SELECT COUNT(*) FROM invite_rewards WHERE status = 'partial'),
    'checked_at', NOW()
  );
END;
$$;

-- Atualizar função get_invite_data_optimized para nova lógica de pontuação
CREATE OR REPLACE FUNCTION get_invite_data_optimized(user_uuid uuid)
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

  -- Buscar amigos convidados com dados completos e status de recompensa
  SELECT COALESCE(JSON_AGG(
    JSON_BUILD_OBJECT(
      'name', COALESCE(p.username, 'Usuário'),
      'status', CASE 
        WHEN ir.status = 'processed' THEN 'Ativo'
        WHEN ir.status = 'partial' THEN 'Parcialmente Ativo'
        ELSE 'Pendente'
      END,
      'reward', COALESCE(ir.reward_amount, 0),
      'level', GREATEST(1, FLOOR(COALESCE(p.total_score, 0) / 1000) + 1),
      'avatar_url', p.avatar_url,
      'total_score', COALESCE(p.total_score, 0),
      'games_played', COALESCE(p.games_played, 0),
      'invited_at', i.created_at,
      'activated_at', ir.processed_at,
      'days_played', COALESCE(
        (SELECT COUNT(DISTINCT activity_date) 
         FROM user_activity_days 
         WHERE user_id = p.id), 0
      ),
      'progress_to_full_reward', LEAST(100, 
        COALESCE(
          (SELECT COUNT(DISTINCT activity_date) * 20 
           FROM user_activity_days 
           WHERE user_id = p.id), 0
        )
      )
    ) ORDER BY i.created_at DESC
  ), '[]'::JSON) INTO invited_friends_data
  FROM invites i
  LEFT JOIN profiles p ON i.used_by = p.id
  LEFT JOIN invite_rewards ir ON ir.invited_user_id = i.used_by AND ir.user_id = user_uuid
  WHERE i.invited_by = user_uuid AND i.used_by IS NOT NULL;

  -- Calcular estatísticas com nova lógica
  WITH invite_stats AS (
    SELECT 
      -- Total de pontos baseado em rewards parciais + processados
      COALESCE(SUM(ir.reward_amount), 0) as total_points,
      -- Contar amigos ativos (que têm reward processado)
      COUNT(CASE WHEN ir.status = 'processed' THEN 1 END) as active_friends,
      -- Total de convites aceitos
      COUNT(i.used_by) as total_invites,
      -- Pontos mensais para ranking
      COALESCE(SUM(
        CASE 
          WHEN i.created_at >= date_trunc('month', current_date) THEN COALESCE(ir.reward_amount, 0)
          ELSE 0
        END
      ), 0) as monthly_points
    FROM invites i
    LEFT JOIN invite_rewards ir ON ir.invited_user_id = i.used_by AND ir.user_id = user_uuid
    WHERE i.invited_by = user_uuid AND i.used_by IS NOT NULL
  ),
  user_level_info AS (
    SELECT 
      p.total_score,
      p.experience_points,
      GREATEST(1, FLOOR(COALESCE(p.total_score, 0) / 1000) + 1) as current_level,
      (FLOOR(COALESCE(p.total_score, 0) / 1000) + 2) as next_level,
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

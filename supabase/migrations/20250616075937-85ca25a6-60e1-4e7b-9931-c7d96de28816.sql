
-- 1. Adicionar campo experience_points na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_points INTEGER DEFAULT 0;

-- 2. Criar índices otimizados para performance
CREATE INDEX IF NOT EXISTS idx_invites_invited_by ON invites(invited_by);
CREATE INDEX IF NOT EXISTS idx_invites_used_by ON invites(used_by);
CREATE INDEX IF NOT EXISTS idx_invite_rewards_user_id ON invite_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_invites_code ON invites(code);
CREATE INDEX IF NOT EXISTS idx_invites_invited_by_active ON invites(invited_by, is_active) WHERE is_active = true;

-- 3. Função RPC otimizada que retorna todos os dados de convite em uma única consulta
CREATE OR REPLACE FUNCTION get_invite_data_optimized(user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  invite_code_val TEXT;
  invited_friends_data JSON;
  stats_data JSON;
BEGIN
  -- Buscar código de convite do usuário
  SELECT code INTO invite_code_val
  FROM invites 
  WHERE invited_by = user_uuid AND is_active = true
  LIMIT 1;

  -- Buscar amigos convidados com dados dos perfis
  SELECT COALESCE(JSON_AGG(
    JSON_BUILD_OBJECT(
      'name', COALESCE(p.username, 'Usuário'),
      'status', CASE WHEN p.games_played > 0 THEN 'Ativo' ELSE 'Pendente' END,
      'reward', CASE WHEN p.games_played > 0 THEN 50 ELSE 0 END,
      'level', FLOOR(COALESCE(p.total_score, 0) / 1000) + 1,
      'avatar_url', p.avatar_url
    )
  ), '[]'::JSON) INTO invited_friends_data
  FROM invites i
  LEFT JOIN profiles p ON i.used_by = p.id
  WHERE i.invited_by = user_uuid AND i.used_by IS NOT NULL;

  -- Calcular estatísticas
  WITH invite_stats AS (
    SELECT 
      COALESCE(SUM(ir.reward_amount), 0) as total_points,
      COUNT(CASE WHEN p.games_played > 0 THEN 1 END) as active_friends,
      COUNT(i.used_by) as total_invites
    FROM invites i
    LEFT JOIN profiles p ON i.used_by = p.id
    LEFT JOIN invite_rewards ir ON ir.user_id = user_uuid AND ir.status = 'processed'
    WHERE i.invited_by = user_uuid AND i.used_by IS NOT NULL
  )
  SELECT JSON_BUILD_OBJECT(
    'totalPoints', total_points,
    'activeFriends', active_friends,
    'totalInvites', total_invites
  ) INTO stats_data
  FROM invite_stats;

  -- Combinar todos os resultados
  SELECT JSON_BUILD_OBJECT(
    'inviteCode', invite_code_val,
    'invitedFriends', invited_friends_data,
    'stats', stats_data
  ) INTO result;

  RETURN result;
END;
$$;

-- 4. Trigger para dar 50XP automaticamente quando código é usado
CREATE OR REPLACE FUNCTION handle_invite_xp_reward()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Só executar se o convite foi usado (used_by passou de NULL para um UUID)
  IF OLD.used_by IS NULL AND NEW.used_by IS NOT NULL THEN
    
    -- Dar 50XP para quem convidou
    UPDATE profiles 
    SET experience_points = COALESCE(experience_points, 0) + 50
    WHERE id = NEW.invited_by;
    
    -- Dar 50XP para quem foi convidado
    UPDATE profiles 
    SET experience_points = COALESCE(experience_points, 0) + 50
    WHERE id = NEW.used_by;
    
    -- Registrar a recompensa no histórico
    INSERT INTO invite_rewards (user_id, invited_user_id, invite_code, reward_amount, status)
    VALUES (NEW.invited_by, NEW.used_by, NEW.code, 50, 'processed');
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar o trigger
DROP TRIGGER IF EXISTS trigger_invite_xp_reward ON invites;
CREATE TRIGGER trigger_invite_xp_reward
  AFTER UPDATE ON invites
  FOR EACH ROW
  EXECUTE FUNCTION handle_invite_xp_reward();

-- 5. Atualizar recompensas existentes para usar XP
UPDATE invite_rewards SET reward_amount = 50 WHERE reward_amount != 50;

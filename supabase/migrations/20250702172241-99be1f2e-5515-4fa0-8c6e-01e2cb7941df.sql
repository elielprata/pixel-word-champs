-- ÍNDICES DE OTIMIZAÇÃO PARA PRODUÇÃO
-- Melhorar performance de queries críticas (sem CONCURRENTLY)

-- Índices para tabela profiles (queries mais frequentes)
CREATE INDEX IF NOT EXISTS idx_profiles_total_score_desc 
ON profiles (total_score DESC NULLS LAST) 
WHERE total_score > 0;

CREATE INDEX IF NOT EXISTS idx_profiles_games_played 
ON profiles (games_played) 
WHERE games_played > 0;

CREATE INDEX IF NOT EXISTS idx_profiles_username_lower 
ON profiles (LOWER(username)) 
WHERE username IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_banned_users 
ON profiles (is_banned, banned_at) 
WHERE is_banned = true;

-- Índices para tabela game_sessions (performance crítica)
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_completed 
ON game_sessions (user_id, is_completed, completed_at DESC) 
WHERE is_completed = true;

CREATE INDEX IF NOT EXISTS idx_game_sessions_competition 
ON game_sessions (competition_id, total_score DESC, completed_at DESC) 
WHERE is_completed = true AND competition_id IS NOT NULL;

-- Índices para tabela weekly_rankings (consultas frequentes)
CREATE INDEX IF NOT EXISTS idx_weekly_rankings_week_position 
ON weekly_rankings (week_start, week_end, position ASC);

CREATE INDEX IF NOT EXISTS idx_weekly_rankings_user_week 
ON weekly_rankings (user_id, week_start DESC);

-- Índices para tabela invites (sistema de indicações)
CREATE INDEX IF NOT EXISTS idx_invites_invited_by_active 
ON invites (invited_by, is_active, created_at DESC) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_invites_used_by_date 
ON invites (used_by, used_at DESC) 
WHERE used_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_invites_code_active 
ON invites (code) 
WHERE is_active = true;

-- Índices para tabela user_roles (verificação de permissões)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role 
ON user_roles (user_id, role);

-- Índices para tabela admin_actions (auditoria)
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_date 
ON admin_actions (admin_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_actions_target_type 
ON admin_actions (target_user_id, action_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_actions_recent 
ON admin_actions (action_type, created_at DESC) 
WHERE created_at > (NOW() - INTERVAL '24 hours');

-- Índices para tabela custom_competitions
CREATE INDEX IF NOT EXISTS idx_custom_competitions_active 
ON custom_competitions (status, start_date DESC, end_date DESC) 
WHERE status IN ('active', 'scheduled');

CREATE INDEX IF NOT EXISTS idx_custom_competitions_type_status 
ON custom_competitions (competition_type, status, start_date DESC);

-- Índices para tabela user_activity_days (tracking de atividade)
CREATE INDEX IF NOT EXISTS idx_user_activity_user_date 
ON user_activity_days (user_id, activity_date DESC);

CREATE INDEX IF NOT EXISTS idx_user_activity_recent 
ON user_activity_days (activity_date DESC) 
WHERE activity_date >= (CURRENT_DATE - INTERVAL '30 days');

-- Índices para tabela invite_rewards
CREATE INDEX IF NOT EXISTS idx_invite_rewards_user_status 
ON invite_rewards (user_id, status, processed_at DESC);

CREATE INDEX IF NOT EXISTS idx_invite_rewards_invited_user 
ON invite_rewards (invited_user_id, status);
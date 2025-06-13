
-- ===================================
-- CORREÇÃO DE FOREIGN KEYS PARA EXCLUSÃO DE USUÁRIOS
-- ===================================

-- 1. REMOVER FOREIGN KEYS EXISTENTES QUE REFERENCIAM auth.users
-- E RECRIAR COM ON DELETE CASCADE ONDE APROPRIADO

-- Tabela: profiles (deve ter CASCADE - perfil deve ser deletado com o usuário)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Tabela: user_roles (deve ter CASCADE - roles devem ser deletadas com o usuário)
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Tabela: game_sessions (deve ter CASCADE - sessões devem ser deletadas com o usuário)
ALTER TABLE game_sessions DROP CONSTRAINT IF EXISTS game_sessions_user_id_fkey;
ALTER TABLE game_sessions ADD CONSTRAINT game_sessions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Tabela: user_word_history (deve ter CASCADE - histórico deve ser deletado com o usuário)
ALTER TABLE user_word_history DROP CONSTRAINT IF EXISTS user_word_history_user_id_fkey;
ALTER TABLE user_word_history ADD CONSTRAINT user_word_history_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Tabela: competition_participations (deve ter CASCADE - participações devem ser deletadas com o usuário)
ALTER TABLE competition_participations DROP CONSTRAINT IF EXISTS competition_participations_user_id_fkey;
ALTER TABLE competition_participations ADD CONSTRAINT competition_participations_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Tabela: weekly_rankings (deve ter CASCADE - rankings devem ser deletados com o usuário)
ALTER TABLE weekly_rankings DROP CONSTRAINT IF EXISTS weekly_rankings_user_id_fkey;
ALTER TABLE weekly_rankings ADD CONSTRAINT weekly_rankings_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Tabela: payment_history (deve ter CASCADE - histórico de pagamentos deve ser deletado com o usuário)
ALTER TABLE payment_history DROP CONSTRAINT IF EXISTS payment_history_user_id_fkey;
ALTER TABLE payment_history ADD CONSTRAINT payment_history_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Tabela: prize_distributions (deve ter CASCADE - distribuições devem ser deletadas com o usuário)
ALTER TABLE prize_distributions DROP CONSTRAINT IF EXISTS prize_distributions_user_id_fkey;
ALTER TABLE prize_distributions ADD CONSTRAINT prize_distributions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Tabela: invite_rewards (deve ter CASCADE para ambos user_id e invited_user_id)
ALTER TABLE invite_rewards DROP CONSTRAINT IF EXISTS invite_rewards_user_id_fkey;
ALTER TABLE invite_rewards ADD CONSTRAINT invite_rewards_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE invite_rewards DROP CONSTRAINT IF EXISTS invite_rewards_invited_user_id_fkey;
ALTER TABLE invite_rewards ADD CONSTRAINT invite_rewards_invited_user_id_fkey 
  FOREIGN KEY (invited_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Tabela: invites (deve ter CASCADE para invited_by e used_by)
ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_invited_by_fkey;
ALTER TABLE invites ADD CONSTRAINT invites_invited_by_fkey 
  FOREIGN KEY (invited_by) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_used_by_fkey;
ALTER TABLE invites ADD CONSTRAINT invites_used_by_fkey 
  FOREIGN KEY (used_by) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Tabela: user_reports (deve ter CASCADE para user_id e assigned_to)
ALTER TABLE user_reports DROP CONSTRAINT IF EXISTS user_reports_user_id_fkey;
ALTER TABLE user_reports ADD CONSTRAINT user_reports_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_reports DROP CONSTRAINT IF EXISTS user_reports_assigned_to_fkey;
ALTER TABLE user_reports ADD CONSTRAINT user_reports_assigned_to_fkey 
  FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Tabela: challenge_progress (deve ter CASCADE - progresso deve ser deletado com o usuário)
ALTER TABLE challenge_progress DROP CONSTRAINT IF EXISTS challenge_progress_user_id_fkey;
ALTER TABLE challenge_progress ADD CONSTRAINT challenge_progress_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Tabela: competition_history (deve ter CASCADE - histórico deve ser deletado com o usuário)
ALTER TABLE competition_history DROP CONSTRAINT IF EXISTS competition_history_user_id_fkey;
ALTER TABLE competition_history ADD CONSTRAINT competition_history_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Tabela: custom_competitions (deve ter SET NULL para created_by - preservar competição)
ALTER TABLE custom_competitions DROP CONSTRAINT IF EXISTS custom_competitions_created_by_fkey;
ALTER TABLE custom_competitions ADD CONSTRAINT custom_competitions_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. PARA ADMIN_ACTIONS - CASOS ESPECIAIS
-- admin_id deve ser SET NULL (preservar o log mas indicar que admin foi deletado)
-- target_user_id deve ser CASCADE (se o usuário alvo foi deletado, o log pode ir junto)

ALTER TABLE admin_actions DROP CONSTRAINT IF EXISTS admin_actions_admin_id_fkey;
ALTER TABLE admin_actions ADD CONSTRAINT admin_actions_admin_id_fkey 
  FOREIGN KEY (admin_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE admin_actions DROP CONSTRAINT IF EXISTS admin_actions_target_user_id_fkey;
ALTER TABLE admin_actions ADD CONSTRAINT admin_actions_target_user_id_fkey 
  FOREIGN KEY (target_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Verificação final
SELECT 
  'FOREIGN KEYS ATUALIZADAS' as status,
  COUNT(*) as total_constraints
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
  AND table_schema = 'public';

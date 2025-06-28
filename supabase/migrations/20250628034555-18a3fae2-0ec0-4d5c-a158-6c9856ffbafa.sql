
-- Criar foreign key entre invites.used_by e profiles.id
ALTER TABLE invites 
ADD CONSTRAINT fk_invites_used_by_profiles 
FOREIGN KEY (used_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Criar índice para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_invites_used_by ON invites(used_by);
CREATE INDEX IF NOT EXISTS idx_invites_invited_by ON invites(invited_by);

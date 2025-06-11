
-- Criar função para buscar dados completos dos usuários incluindo email real
CREATE OR REPLACE FUNCTION public.get_users_with_real_emails()
RETURNS TABLE (
  id uuid,
  username text,
  email text,
  total_score integer,
  games_played integer,
  is_banned boolean,
  banned_at timestamp with time zone,
  banned_by uuid,
  ban_reason text,
  created_at timestamp with time zone,
  roles text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    COALESCE(au.email, 'Email não disponível') as email,
    COALESCE(p.total_score, 0) as total_score,
    COALESCE(p.games_played, 0) as games_played,
    COALESCE(p.is_banned, false) as is_banned,
    p.banned_at,
    p.banned_by,
    p.ban_reason,
    p.created_at,
    COALESCE(
      ARRAY(
        SELECT ur.role::text 
        FROM user_roles ur 
        WHERE ur.user_id = p.id
      ), 
      ARRAY['user']
    ) as roles
  FROM profiles p
  LEFT JOIN auth.users au ON p.id = au.id
  ORDER BY p.created_at DESC;
END;
$$;

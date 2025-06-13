
-- Remove existing policies that might conflict and recreate them properly
DROP POLICY IF EXISTS "users_own_sessions_select" ON public.game_sessions;
DROP POLICY IF EXISTS "users_own_sessions_insert" ON public.game_sessions;
DROP POLICY IF EXISTS "users_own_sessions_update" ON public.game_sessions;

-- Create policy that allows users to view their own game sessions
CREATE POLICY "Users can view their own sessions" ON public.game_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create policy that allows users to create their own game sessions
CREATE POLICY "Users can create their own sessions" ON public.game_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create policy that allows users to update their own game sessions
CREATE POLICY "Users can update their own sessions" ON public.game_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policy that allows admins to manage all game sessions
CREATE POLICY "Admins can manage all sessions" ON public.game_sessions
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

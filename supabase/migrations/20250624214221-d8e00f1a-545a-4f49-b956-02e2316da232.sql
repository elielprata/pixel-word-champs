
-- Corrigir foreign key da tabela support_tickets para referenciar profiles ao invés de auth.users
ALTER TABLE public.support_tickets 
DROP CONSTRAINT IF EXISTS support_tickets_user_id_fkey;

ALTER TABLE public.support_tickets 
ADD CONSTRAINT support_tickets_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Atualizar as políticas RLS para usar a nova relação
DROP POLICY IF EXISTS "Users can view their own support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can create their own support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can update their own support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can view all support tickets" ON public.support_tickets;

-- Recriar políticas com a referência correta
CREATE POLICY "Users can view their own support tickets" 
  ON public.support_tickets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own support tickets" 
  ON public.support_tickets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own support tickets" 
  ON public.support_tickets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all support tickets" 
  ON public.support_tickets 
  FOR ALL 
  USING (public.is_admin());

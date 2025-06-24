
-- Criar tabela support_tickets para o sistema de suporte
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem seus próprios tickets
CREATE POLICY "Users can view their own support tickets" 
  ON public.support_tickets 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para usuários criarem seus próprios tickets
CREATE POLICY "Users can create their own support tickets" 
  ON public.support_tickets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem seus próprios tickets
CREATE POLICY "Users can update their own support tickets" 
  ON public.support_tickets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para admins verem todos os tickets
CREATE POLICY "Admins can view all support tickets" 
  ON public.support_tickets 
  FOR ALL 
  USING (public.is_admin());

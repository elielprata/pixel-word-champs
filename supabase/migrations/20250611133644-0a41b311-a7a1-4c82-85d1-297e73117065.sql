
-- Criar tabela para armazenar histórico de participações em competições finalizadas
CREATE TABLE public.competition_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID NOT NULL,
  competition_title TEXT NOT NULL,
  competition_type TEXT NOT NULL,
  user_id UUID NOT NULL,
  final_score INTEGER NOT NULL DEFAULT 0,
  final_position INTEGER NOT NULL,
  total_participants INTEGER NOT NULL DEFAULT 0,
  prize_earned NUMERIC DEFAULT 0,
  competition_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  competition_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  finalized_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS para garantir que usuários só vejam seu próprio histórico
ALTER TABLE public.competition_history ENABLE ROW LEVEL SECURITY;

-- Política para visualizar próprio histórico
CREATE POLICY "Users can view their own competition history" 
  ON public.competition_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para admins visualizarem todo o histórico
CREATE POLICY "Admins can view all competition history" 
  ON public.competition_history 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Política para inserção (apenas sistema pode inserir)
CREATE POLICY "System can insert competition history" 
  ON public.competition_history 
  FOR INSERT 
  WITH CHECK (true);

-- Adicionar índices para melhor performance
CREATE INDEX idx_competition_history_user_id ON public.competition_history(user_id);
CREATE INDEX idx_competition_history_competition_id ON public.competition_history(competition_id);
CREATE INDEX idx_competition_history_finalized_at ON public.competition_history(finalized_at);

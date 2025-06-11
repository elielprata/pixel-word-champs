
-- Criar tabela para histórico de palavras usadas por usuários
CREATE TABLE public.user_word_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  competition_id UUID NULL,
  level INTEGER NOT NULL DEFAULT 1,
  category TEXT NOT NULL DEFAULT 'geral',
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_word_history ENABLE ROW LEVEL SECURITY;

-- Política para usuários visualizarem apenas seu próprio histórico
CREATE POLICY "Users can view their own word history" 
  ON public.user_word_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para usuários inserirem apenas seu próprio histórico
CREATE POLICY "Users can insert their own word history" 
  ON public.user_word_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para admins visualizarem todo o histórico
CREATE POLICY "Admins can view all word history" 
  ON public.user_word_history 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Índices para melhor performance
CREATE INDEX idx_user_word_history_user_id ON public.user_word_history(user_id);
CREATE INDEX idx_user_word_history_word ON public.user_word_history(word);
CREATE INDEX idx_user_word_history_competition_id ON public.user_word_history(competition_id);
CREATE INDEX idx_user_word_history_used_at ON public.user_word_history(used_at);
CREATE INDEX idx_user_word_history_category ON public.user_word_history(category);

-- Índice composto para consultas de histórico por usuário e data
CREATE INDEX idx_user_word_history_user_date ON public.user_word_history(user_id, used_at DESC);

-- Comentários para documentação
COMMENT ON TABLE public.user_word_history IS 'Histórico de palavras usadas por cada usuário para evitar repetições';
COMMENT ON COLUMN public.user_word_history.user_id IS 'ID do usuário que usou a palavra';
COMMENT ON COLUMN public.user_word_history.word IS 'Palavra utilizada (sempre em maiúsculas)';
COMMENT ON COLUMN public.user_word_history.competition_id IS 'ID da competição onde a palavra foi usada (null para jogos livres)';
COMMENT ON COLUMN public.user_word_history.level IS 'Nível do jogo onde a palavra foi usada';
COMMENT ON COLUMN public.user_word_history.category IS 'Categoria da palavra';
COMMENT ON COLUMN public.user_word_history.used_at IS 'Data e hora quando a palavra foi usada';

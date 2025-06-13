
-- Criar políticas RLS para user_word_history
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

-- Política para usuários atualizarem apenas seu próprio histórico
CREATE POLICY "Users can update their own word history" 
  ON public.user_word_history 
  FOR UPDATE 
  USING (auth.uid() = user_id);


-- Criar política para permitir que usuários autenticados vejam palavras ativas
CREATE POLICY "Users can view active level words" ON public.level_words
  FOR SELECT
  TO authenticated
  USING (is_active = true);

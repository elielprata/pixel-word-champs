
-- Criar políticas RLS para operações de escrita na tabela monthly_invite_prizes
-- Permitir que apenas administradores possam criar, atualizar e excluir prêmios

-- Política para INSERT - apenas admins podem criar prêmios
CREATE POLICY "Admins can create monthly invite prizes" 
  ON public.monthly_invite_prizes 
  FOR INSERT 
  WITH CHECK (public.is_admin());

-- Política para UPDATE - apenas admins podem atualizar prêmios
CREATE POLICY "Admins can update monthly invite prizes" 
  ON public.monthly_invite_prizes 
  FOR UPDATE 
  USING (public.is_admin());

-- Política para DELETE - apenas admins podem excluir prêmios
CREATE POLICY "Admins can delete monthly invite prizes" 
  ON public.monthly_invite_prizes 
  FOR DELETE 
  USING (public.is_admin());

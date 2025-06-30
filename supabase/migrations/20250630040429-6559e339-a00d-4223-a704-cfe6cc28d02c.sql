
-- Remover a função update_user_points_v2 que não é mais necessária
DROP FUNCTION IF EXISTS public.update_user_points_v2(uuid, integer);

-- Adicionar comentário para documentar a remoção
COMMENT ON FUNCTION public.update_user_scores(uuid, integer, integer) IS 'Função principal para atualizar pontuações - substitui update_user_points_v2 removida';

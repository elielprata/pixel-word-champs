
-- Adicionar constraint UNIQUE para permitir operações upsert na tabela challenge_progress
-- Isso resolve o erro HTTP 400 que impede o salvamento do progresso dos desafios
ALTER TABLE public.challenge_progress 
ADD CONSTRAINT unique_user_competition_progress 
UNIQUE (user_id, competition_id);

-- Comentário para documentação
COMMENT ON CONSTRAINT unique_user_competition_progress ON public.challenge_progress 
IS 'Constraint único para combinação usuário-competição - necessário para operações upsert';

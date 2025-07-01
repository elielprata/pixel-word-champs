
-- Adicionar constraint UNIQUE para permitir operações upsert na tabela competition_participations
-- Isso resolve o erro HTTP 400 que impede o salvamento do progresso dos desafios
ALTER TABLE public.competition_participations 
ADD CONSTRAINT unique_user_competition_participation 
UNIQUE (user_id, competition_id);

-- Comentário para documentação
COMMENT ON CONSTRAINT unique_user_competition_participation ON public.competition_participations 
IS 'Constraint único para combinação usuário-competição - necessário para operações upsert';

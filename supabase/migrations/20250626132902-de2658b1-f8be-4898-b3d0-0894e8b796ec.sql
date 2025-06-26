
-- Remover o trigger que força horários de 23:59:59
DROP TRIGGER IF EXISTS trigger_ensure_competition_standard_times ON custom_competitions;

-- Remover a função associada
DROP FUNCTION IF EXISTS public.ensure_competition_standard_times();

-- Verificar e remover outros triggers similares se existirem
DROP TRIGGER IF EXISTS trigger_ensure_daily_competition_end_time ON custom_competitions;
DROP FUNCTION IF EXISTS public.ensure_daily_competition_end_time();

-- Adicionar comentário para documentar a remoção
COMMENT ON TABLE custom_competitions IS 'Tabela de competições customizadas. Triggers de horário forçado removidos para respeitar horários definidos pelo usuário.';

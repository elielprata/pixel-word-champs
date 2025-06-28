
-- Garantir que existam prêmios configurados para a competição mensal atual
DO $$
DECLARE
  current_month TEXT;
  competition_id_val UUID;
  prizes_count INTEGER;
BEGIN
  -- Obter mês atual
  current_month := to_char(current_date, 'YYYY-MM');
  
  -- Buscar ou criar competição do mês atual
  SELECT id INTO competition_id_val
  FROM monthly_invite_competitions 
  WHERE month_year = current_month;
  
  -- Se não existir competição, criar uma
  IF competition_id_val IS NULL THEN
    INSERT INTO monthly_invite_competitions (
      month_year,
      title,
      description,
      start_date,
      end_date,
      status,
      total_prize_pool
    ) VALUES (
      current_month,
      'Competição de Indicações - ' || to_char(to_date(current_month, 'YYYY-MM'), 'Month YYYY'),
      'Competição mensal baseada em indicações de novos usuários',
      (current_month || '-01')::date,
      (date_trunc('month', (current_month || '-01')::date) + interval '1 month - 1 day')::date,
      'active',
      700
    ) RETURNING id INTO competition_id_val;
  END IF;
  
  -- Verificar se já existem prêmios configurados
  SELECT COUNT(*) INTO prizes_count
  FROM monthly_invite_prizes 
  WHERE competition_id = competition_id_val;
  
  -- Se não existem prêmios, criar os padrões
  IF prizes_count = 0 THEN
    INSERT INTO monthly_invite_prizes (competition_id, position, prize_amount, active, description) VALUES
    (competition_id_val, 1, 400, true, 'Primeiro lugar - Campeão do Mês'),
    (competition_id_val, 2, 200, true, 'Second lugar - Vice-campeão'),
    (competition_id_val, 3, 100, true, 'Terceiro lugar - Terceiro colocado');
    
    -- Atualizar o pool total na competição
    UPDATE monthly_invite_competitions 
    SET total_prize_pool = 700
    WHERE id = competition_id_val;
    
    RAISE NOTICE 'Prêmios padrão criados para a competição %', competition_id_val;
  END IF;
END;
$$;


-- Função para calcular e atualizar participantes da competição mensal
CREATE OR REPLACE FUNCTION public.update_monthly_competition_participants(target_month text DEFAULT to_char(current_date, 'YYYY-MM'))
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  competition_record RECORD;
  participants_count INTEGER := 0;
  result jsonb;
BEGIN
  -- Buscar ou criar competição do mês
  SELECT * INTO competition_record
  FROM monthly_invite_competitions
  WHERE month_year = target_month;
  
  -- Se não existe, criar competição para o mês
  IF competition_record IS NULL THEN
    INSERT INTO monthly_invite_competitions (
      month_year, 
      title, 
      start_date, 
      end_date,
      status
    ) VALUES (
      target_month,
      'Competição de Indicações - ' || to_char(to_date(target_month, 'YYYY-MM'), 'Month YYYY'),
      date_trunc('month', to_date(target_month, 'YYYY-MM'))::date,
      (date_trunc('month', to_date(target_month, 'YYYY-MM')) + interval '1 month - 1 day')::date,
      CASE 
        WHEN target_month = to_char(current_date, 'YYYY-MM') THEN 'active'
        WHEN to_date(target_month, 'YYYY-MM') > current_date THEN 'scheduled'
        ELSE 'completed'
      END
    ) RETURNING * INTO competition_record;
  END IF;
  
  -- Calcular participantes baseado em convites reais do mês
  SELECT COUNT(DISTINCT i.invited_by) INTO participants_count
  FROM invites i
  WHERE i.used_by IS NOT NULL
    AND to_char(i.used_at, 'YYYY-MM') = target_month;
  
  -- Atualizar total de participantes na competição
  UPDATE monthly_invite_competitions 
  SET 
    total_participants = participants_count,
    updated_at = NOW()
  WHERE id = competition_record.id;
  
  RETURN jsonb_build_object(
    'competition_id', competition_record.id,
    'month_year', target_month,
    'total_participants', participants_count,
    'updated_at', NOW()
  );
END;
$$;

-- Função para popular ranking mensal baseado nos dados reais de convites
CREATE OR REPLACE FUNCTION public.populate_monthly_invite_ranking(target_month text DEFAULT to_char(current_date, 'YYYY-MM'))
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  competition_record RECORD;
  ranking_result jsonb;
  affected_users INTEGER := 0;
BEGIN
  -- Garantir que a competição existe e tem participantes atualizados
  SELECT populate_monthly_competition_and_points(target_month) INTO ranking_result;
  
  -- Buscar competição atualizada
  SELECT * INTO competition_record
  FROM monthly_invite_competitions
  WHERE month_year = target_month;
  
  IF competition_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Competição não encontrada'
    );
  END IF;
  
  -- Popular ranking baseado nos pontos mensais calculados
  WITH ranked_users AS (
    SELECT 
      mip.user_id,
      p.username,
      p.pix_key,
      p.pix_holder_name,
      mip.invite_points,
      mip.invites_count,
      mip.active_invites_count,
      ROW_NUMBER() OVER (ORDER BY mip.invite_points DESC, mip.active_invites_count DESC, mip.invites_count DESC) as position
    FROM monthly_invite_points mip
    JOIN profiles p ON p.id = mip.user_id
    WHERE mip.month_year = target_month
      AND mip.invite_points > 0
  ),
  prize_calculation AS (
    SELECT 
      user_id,
      username,
      pix_key,
      pix_holder_name,
      position,
      invite_points,
      invites_count,
      active_invites_count,
      -- Buscar prêmio configurado para esta posição
      COALESCE(
        (SELECT prize_amount 
         FROM monthly_invite_prizes mip 
         WHERE mip.competition_id = competition_record.id 
           AND mip.position = ranked_users.position 
           AND mip.active = true
         LIMIT 1), 
        0
      ) as prize_amount
    FROM ranked_users
  )
  INSERT INTO monthly_invite_rankings (
    competition_id, user_id, username, position, 
    invite_points, invites_count, active_invites_count,
    prize_amount, payment_status, pix_key, pix_holder_name
  )
  SELECT 
    competition_record.id,
    user_id,
    username,
    position,
    invite_points,
    invites_count,
    active_invites_count,
    prize_amount,
    CASE WHEN prize_amount > 0 THEN 'pending' ELSE 'not_eligible' END,
    pix_key,
    pix_holder_name
  FROM prize_calculation
  ON CONFLICT (competition_id, user_id) 
  DO UPDATE SET
    position = EXCLUDED.position,
    invite_points = EXCLUDED.invite_points,
    invites_count = EXCLUDED.invites_count,
    active_invites_count = EXCLUDED.active_invites_count,
    prize_amount = EXCLUDED.prize_amount,
    payment_status = EXCLUDED.payment_status,
    pix_key = EXCLUDED.pix_key,
    pix_holder_name = EXCLUDED.pix_holder_name,
    updated_at = NOW();
  
  GET DIAGNOSTICS affected_users = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'competition_id', competition_record.id,
    'month_year', target_month,
    'affected_users', affected_users,
    'total_participants', competition_record.total_participants,
    'updated_at', NOW()
  );
END;
$$;

-- Função para calcular pontos mensais baseado nos convites reais
CREATE OR REPLACE FUNCTION public.populate_monthly_competition_and_points(target_month text DEFAULT to_char(current_date, 'YYYY-MM'))
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  competition_record RECORD;
  users_processed INTEGER := 0;
BEGIN
  -- Atualizar participantes da competição
  PERFORM update_monthly_competition_participants(target_month);
  
  -- Buscar competição
  SELECT * INTO competition_record
  FROM monthly_invite_competitions
  WHERE month_year = target_month;
  
  -- Popular ou atualizar pontos mensais baseado nos convites reais
  WITH user_invite_stats AS (
    SELECT 
      i.invited_by as user_id,
      COUNT(i.used_by) as total_invites,
      COUNT(CASE WHEN p.games_played > 0 THEN 1 END) as active_invites,
      COUNT(CASE WHEN p.games_played > 0 THEN 1 END) * 50 as invite_points
    FROM invites i
    LEFT JOIN profiles p ON i.used_by = p.id
    WHERE i.used_by IS NOT NULL
      AND to_char(i.used_at, 'YYYY-MM') = target_month
    GROUP BY i.invited_by
  )
  INSERT INTO monthly_invite_points (
    user_id, month_year, invite_points, invites_count, active_invites_count
  )
  SELECT 
    user_id,
    target_month,
    invite_points,
    total_invites,
    active_invites
  FROM user_invite_stats
  WHERE invite_points > 0
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET
    invite_points = EXCLUDED.invite_points,
    invites_count = EXCLUDED.invites_count,
    active_invites_count = EXCLUDED.active_invites_count,
    last_updated = NOW();
  
  GET DIAGNOSTICS users_processed = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'competition_id', competition_record.id,
    'users_processed', users_processed,
    'month_year', target_month
  );
END;
$$;

-- Trigger para atualizar automaticamente quando convites são processados
CREATE OR REPLACE FUNCTION public.update_monthly_invite_data_on_invite_use()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invite_month text;
BEGIN
  -- Só executar se o convite foi usado (used_by passou de NULL para um UUID)
  IF OLD.used_by IS NULL AND NEW.used_by IS NOT NULL THEN
    -- Obter mês do convite
    invite_month := to_char(NEW.used_at, 'YYYY-MM');
    
    -- Atualizar dados mensais do convidador
    PERFORM populate_monthly_competition_and_points(invite_month);
    
    -- Atualizar ranking mensal
    PERFORM populate_monthly_invite_ranking(invite_month);
    
    RAISE NOTICE 'Dados mensais atualizados para convite usado em %', invite_month;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger que dispara após uso de convite
DROP TRIGGER IF EXISTS trigger_update_monthly_invite_data ON invites;
CREATE TRIGGER trigger_update_monthly_invite_data
  AFTER UPDATE
  ON invites
  FOR EACH ROW
  EXECUTE FUNCTION update_monthly_invite_data_on_invite_use();


-- 1. Adicionar novo status 'ended' para competições que terminaram mas ainda não foram finalizadas
ALTER TABLE weekly_config 
ADD CONSTRAINT valid_status CHECK (status IN ('scheduled', 'active', 'ended', 'completed'));

-- 2. Atualizar função de atualização de status para não marcar diretamente como 'completed'
CREATE OR REPLACE FUNCTION public.update_weekly_competitions_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_date_local DATE;
  updated_count INTEGER := 0;
  competitions_updated jsonb := '[]'::jsonb;
  comp_record RECORD;
BEGIN
  current_date_local := CURRENT_DATE;
  
  RAISE NOTICE 'Iniciando atualização de status de competições semanais para data: %', current_date_local;
  
  FOR comp_record IN 
    SELECT id, start_date, end_date, status
    FROM weekly_config 
    WHERE status IN ('scheduled', 'active', 'ended')
  LOOP
    DECLARE
      correct_status TEXT;
      old_status TEXT := comp_record.status;
    BEGIN
      IF current_date_local < comp_record.start_date THEN
        correct_status := 'scheduled';
      ELSIF current_date_local >= comp_record.start_date AND current_date_local <= comp_record.end_date THEN
        correct_status := 'active';
      ELSE
        -- Competições que passaram da data final ficam como 'ended' até serem finalizadas manualmente
        correct_status := 'ended';
      END IF;
      
      IF old_status != correct_status THEN
        UPDATE weekly_config 
        SET 
          status = correct_status,
          updated_at = NOW(),
          activated_at = CASE WHEN correct_status = 'active' AND old_status = 'scheduled' THEN NOW() ELSE activated_at END
        WHERE id = comp_record.id;
        
        updated_count := updated_count + 1;
        
        competitions_updated := competitions_updated || jsonb_build_object(
          'id', comp_record.id,
          'old_status', old_status,
          'new_status', correct_status,
          'start_date', comp_record.start_date,
          'end_date', comp_record.end_date,
          'current_date', current_date_local
        );
        
        RAISE NOTICE 'Competição % atualizada: % -> %', 
          comp_record.id, old_status, correct_status;
      END IF;
    END;
  END LOOP;
  
  IF updated_count > 0 THEN
    PERFORM update_weekly_ranking();
  END IF;
  
  RAISE NOTICE 'Atualização concluída: % competições atualizadas', updated_count;
  
  RETURN jsonb_build_object(
    'success', true,
    'updated_count', updated_count,
    'competitions_updated', competitions_updated,
    'executed_at', NOW(),
    'current_date', current_date_local
  );
END;
$$;

-- 3. Adicionar constraint para garantir que competições 'completed' sempre tenham snapshot
CREATE OR REPLACE FUNCTION validate_completed_competition_has_snapshot()
RETURNS TRIGGER AS $$
BEGIN
  -- Se está sendo marcada como 'completed', verificar se tem snapshot
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    IF NOT EXISTS (
      SELECT 1 FROM weekly_competitions_snapshot 
      WHERE competition_id = NEW.id
    ) THEN
      RAISE EXCEPTION 'Competição não pode ser marcada como completed sem ter snapshot. Use a função finalize_weekly_competition.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_completed_competition_has_snapshot
  BEFORE UPDATE ON weekly_config
  FOR EACH ROW
  EXECUTE FUNCTION validate_completed_competition_has_snapshot();

-- 4. Migrar competições existentes que estão 'completed' mas sem snapshot
-- Primeiro, identificar essas competições e criar snapshots para elas
DO $$
DECLARE
  comp_record RECORD;
  winners_snapshot JSONB;
  rankings_snapshot JSONB;
BEGIN
  FOR comp_record IN 
    SELECT wc.* FROM weekly_config wc
    WHERE wc.status = 'completed'
      AND NOT EXISTS (
        SELECT 1 FROM weekly_competitions_snapshot wcs 
        WHERE wcs.competition_id = wc.id
      )
  LOOP
    -- Capturar dados dos ganhadores (se existirem)
    SELECT jsonb_agg(
      jsonb_build_object(
        'user_id', user_id,
        'username', username,
        'position', position,
        'total_score', total_score,
        'prize_amount', prize_amount,
        'pix_key', pix_key,
        'pix_holder_name', pix_holder_name,
        'payment_status', payment_status
      )
    ) INTO winners_snapshot
    FROM weekly_rankings
    WHERE week_start = comp_record.start_date 
      AND week_end = comp_record.end_date
      AND prize_amount > 0;
    
    -- Capturar todos os dados do ranking
    SELECT jsonb_agg(
      jsonb_build_object(
        'user_id', user_id,
        'username', username,
        'position', position,
        'total_score', total_score,
        'prize_amount', prize_amount
      )
    ) INTO rankings_snapshot
    FROM weekly_rankings
    WHERE week_start = comp_record.start_date 
      AND week_end = comp_record.end_date;
    
    -- Criar snapshot da competição
    INSERT INTO weekly_competitions_snapshot (
      competition_id,
      start_date,
      end_date,
      total_participants,
      total_prize_pool,
      winners_data,
      rankings_data
    ) VALUES (
      comp_record.id,
      comp_record.start_date,
      comp_record.end_date,
      (SELECT COUNT(*) FROM weekly_rankings WHERE week_start = comp_record.start_date),
      (SELECT COALESCE(SUM(prize_amount), 0) FROM weekly_rankings WHERE week_start = comp_record.start_date),
      COALESCE(winners_snapshot, '[]'::jsonb),
      COALESCE(rankings_snapshot, '[]'::jsonb)
    );
    
    RAISE NOTICE 'Snapshot criado para competição % (% - %)', 
      comp_record.id, comp_record.start_date, comp_record.end_date;
  END LOOP;
END $$;

-- 5. Atualizar função de finalização para garantir que só marque como 'completed' após criar snapshot
CREATE OR REPLACE FUNCTION public.finalize_weekly_competition()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  active_or_ended_config RECORD;
  scheduled_config RECORD;
  winners_snapshot JSONB;
  rankings_snapshot JSONB;
  affected_profiles INTEGER;
  snapshot_id UUID;
BEGIN
  -- Buscar configuração ativa ou ended
  SELECT * INTO active_or_ended_config 
  FROM weekly_config 
  WHERE status IN ('active', 'ended')
  ORDER BY 
    CASE WHEN status = 'active' THEN 1 ELSE 2 END,
    end_date DESC
  LIMIT 1;
  
  IF active_or_ended_config IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Nenhuma configuração ativa ou finalizada encontrada'
    );
  END IF;
  
  -- Capturar dados dos ganhadores (com prêmio > 0)
  SELECT jsonb_agg(
    jsonb_build_object(
      'user_id', user_id,
      'username', username,
      'position', position,
      'total_score', total_score,
      'prize_amount', prize_amount,
      'pix_key', pix_key,
      'pix_holder_name', pix_holder_name,
      'payment_status', payment_status
    )
  ) INTO winners_snapshot
  FROM weekly_rankings
  WHERE week_start = active_or_ended_config.start_date 
    AND week_end = active_or_ended_config.end_date
    AND prize_amount > 0;
  
  -- Capturar todos os dados do ranking
  SELECT jsonb_agg(
    jsonb_build_object(
      'user_id', user_id,
      'username', username,
      'position', position,
      'total_score', total_score,
      'prize_amount', prize_amount
    )
  ) INTO rankings_snapshot
  FROM weekly_rankings
  WHERE week_start = active_or_ended_config.start_date 
    AND week_end = active_or_ended_config.end_date;
  
  -- PRIMEIRO: Criar snapshot da competição finalizada
  INSERT INTO weekly_competitions_snapshot (
    competition_id,
    start_date,
    end_date,
    total_participants,
    total_prize_pool,
    winners_data,
    rankings_data
  ) VALUES (
    active_or_ended_config.id,
    active_or_ended_config.start_date,
    active_or_ended_config.end_date,
    (SELECT COUNT(*) FROM weekly_rankings WHERE week_start = active_or_ended_config.start_date),
    (SELECT COALESCE(SUM(prize_amount), 0) FROM weekly_rankings WHERE week_start = active_or_ended_config.start_date),
    COALESCE(winners_snapshot, '[]'::jsonb),
    COALESCE(rankings_snapshot, '[]'::jsonb)
  ) RETURNING id INTO snapshot_id;
  
  -- SEGUNDO: Marcar competição como completada (agora o trigger vai permitir pois tem snapshot)
  UPDATE weekly_config 
  SET status = 'completed', completed_at = NOW()
  WHERE id = active_or_ended_config.id;
  
  -- Resetar pontuações dos perfis
  UPDATE profiles 
  SET 
    total_score = 0,
    best_weekly_position = NULL,
    updated_at = NOW()
  WHERE total_score > 0 OR best_weekly_position IS NOT NULL;
  
  GET DIAGNOSTICS affected_profiles = ROW_COUNT;
  
  -- Ativar próxima competição agendada se existir
  SELECT * INTO scheduled_config 
  FROM weekly_config 
  WHERE status = 'scheduled' 
  ORDER BY start_date ASC 
  LIMIT 1;
  
  IF scheduled_config IS NOT NULL THEN
    UPDATE weekly_config 
    SET status = 'active', activated_at = NOW()
    WHERE id = scheduled_config.id;
  END IF;
  
  -- Registrar no log de automação
  INSERT INTO automation_logs (
    automation_type,
    scheduled_time,
    executed_at,
    execution_status,
    affected_users,
    settings_snapshot
  ) VALUES (
    'weekly_competition_finalization',
    NOW(),
    NOW(),
    'completed',
    affected_profiles,
    jsonb_build_object(
      'finalized_competition', active_or_ended_config,
      'activated_competition', scheduled_config,
      'snapshot_id', snapshot_id,
      'profiles_reset', affected_profiles
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'snapshot_id', snapshot_id,
    'finalized_competition', active_or_ended_config,
    'activated_competition', scheduled_config,
    'profiles_reset', affected_profiles,
    'winners_count', jsonb_array_length(COALESCE(winners_snapshot, '[]'::jsonb))
  );
END;
$$;


-- 1. Adicionar campo status na tabela weekly_config
ALTER TABLE weekly_config ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'scheduled', 'completed'));
ALTER TABLE weekly_config ADD COLUMN activated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE weekly_config ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;

-- 2. Migrar dados existentes
UPDATE weekly_config SET status = 'active' WHERE is_active = true;
UPDATE weekly_config SET status = 'completed' WHERE is_active = false;

-- 3. Remover campo is_active após migração
ALTER TABLE weekly_config DROP COLUMN is_active;

-- 4. Criar constraint para garantir apenas uma competição ativa
CREATE UNIQUE INDEX idx_weekly_config_active ON weekly_config (status) WHERE status = 'active';

-- 5. Criar tabela para snapshot das competições finalizadas
CREATE TABLE weekly_competitions_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_participants INTEGER NOT NULL DEFAULT 0,
  total_prize_pool NUMERIC NOT NULL DEFAULT 0,
  winners_data JSONB NOT NULL,
  rankings_data JSONB NOT NULL,
  finalized_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 6. Atualizar função should_reset_weekly_ranking para considerar status
CREATE OR REPLACE FUNCTION public.should_reset_weekly_ranking()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  active_config RECORD;
  scheduled_config RECORD;
  should_reset BOOLEAN := false;
  reset_info jsonb;
BEGIN
  -- Buscar configuração ativa
  SELECT * INTO active_config 
  FROM weekly_config 
  WHERE status = 'active' 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Buscar próxima configuração agendada
  SELECT * INTO scheduled_config 
  FROM weekly_config 
  WHERE status = 'scheduled' 
  ORDER BY start_date ASC 
  LIMIT 1;
  
  -- Se não houver configuração ativa, retornar sem resetar
  IF active_config IS NULL THEN
    RETURN jsonb_build_object(
      'should_reset', false,
      'error', 'Nenhuma configuração ativa encontrada'
    );
  END IF;
  
  -- Verificar se deve resetar (passou do fim da competição)
  should_reset := current_date > active_config.end_date;
  
  -- Compilar informações do reset
  SELECT jsonb_build_object(
    'should_reset', should_reset,
    'current_date', current_date,
    'active_competition', jsonb_build_object(
      'id', active_config.id,
      'start_date', active_config.start_date,
      'end_date', active_config.end_date
    ),
    'scheduled_competition', CASE 
      WHEN scheduled_config IS NOT NULL THEN jsonb_build_object(
        'id', scheduled_config.id,
        'start_date', scheduled_config.start_date,
        'end_date', scheduled_config.end_date
      )
      ELSE null
    END,
    'next_reset_date', active_config.end_date + 1
  ) INTO reset_info;
  
  RETURN reset_info;
END;
$function$;

-- 7. Criar função para finalizar competição e fazer snapshot
CREATE OR REPLACE FUNCTION public.finalize_weekly_competition()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  active_config RECORD;
  scheduled_config RECORD;
  winners_snapshot JSONB;
  rankings_snapshot JSONB;
  affected_profiles INTEGER;
  snapshot_id UUID;
BEGIN
  -- Buscar configuração ativa
  SELECT * INTO active_config 
  FROM weekly_config 
  WHERE status = 'active' 
  LIMIT 1;
  
  -- Se não houver configuração ativa, retornar erro
  IF active_config IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Nenhuma configuração ativa encontrada'
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
  WHERE week_start = active_config.start_date 
    AND week_end = active_config.end_date
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
  WHERE week_start = active_config.start_date 
    AND week_end = active_config.end_date;
  
  -- Criar snapshot da competição finalizada
  INSERT INTO weekly_competitions_snapshot (
    competition_id,
    start_date,
    end_date,
    total_participants,
    total_prize_pool,
    winners_data,
    rankings_data
  ) VALUES (
    active_config.id,
    active_config.start_date,
    active_config.end_date,
    (SELECT COUNT(*) FROM weekly_rankings WHERE week_start = active_config.start_date),
    (SELECT COALESCE(SUM(prize_amount), 0) FROM weekly_rankings WHERE week_start = active_config.start_date),
    COALESCE(winners_snapshot, '[]'::jsonb),
    COALESCE(rankings_snapshot, '[]'::jsonb)
  ) RETURNING id INTO snapshot_id;
  
  -- Marcar competição ativa como completada
  UPDATE weekly_config 
  SET status = 'completed', completed_at = NOW()
  WHERE id = active_config.id;
  
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
      'finalized_competition', active_config,
      'activated_competition', scheduled_config,
      'snapshot_id', snapshot_id,
      'profiles_reset', affected_profiles
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'snapshot_id', snapshot_id,
    'finalized_competition', active_config,
    'activated_competition', scheduled_config,
    'profiles_reset', affected_profiles,
    'winners_count', jsonb_array_length(COALESCE(winners_snapshot, '[]'::jsonb))
  );
END;
$function$;

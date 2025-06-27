
-- Função para atualizar competições agendadas
CREATE OR REPLACE FUNCTION public.update_scheduled_competition(
  competition_id uuid,
  new_start_date date,
  new_end_date date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  config_record RECORD;
  overlapping_count INTEGER;
BEGIN
  -- Verificar se a competição existe e está agendada
  SELECT * INTO config_record 
  FROM weekly_config 
  WHERE id = competition_id AND status = 'scheduled';
  
  IF config_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Competição não encontrada ou não está agendada'
    );
  END IF;
  
  -- Validar datas
  IF new_start_date >= new_end_date THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Data de início deve ser anterior à data de fim'
    );
  END IF;
  
  -- Verificar sobreposição com outras competições
  SELECT COUNT(*) INTO overlapping_count
  FROM weekly_config
  WHERE id != competition_id
    AND status IN ('active', 'scheduled')
    AND (
      (new_start_date BETWEEN start_date AND end_date) OR
      (new_end_date BETWEEN start_date AND end_date) OR
      (start_date BETWEEN new_start_date AND new_end_date)
    );
  
  IF overlapping_count > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'As datas se sobrepõem com outra competição'
    );
  END IF;
  
  -- Atualizar a competição
  UPDATE weekly_config
  SET 
    start_date = new_start_date,
    end_date = new_end_date,
    updated_at = NOW()
  WHERE id = competition_id;
  
  -- Registrar no log de auditoria
  INSERT INTO automation_logs (
    automation_type,
    scheduled_time,
    executed_at,
    execution_status,
    affected_users,
    settings_snapshot
  ) VALUES (
    'competition_update',
    NOW(),
    NOW(),
    'completed',
    0,
    jsonb_build_object(
      'competition_id', competition_id,
      'old_start_date', config_record.start_date,
      'old_end_date', config_record.end_date,
      'new_start_date', new_start_date,
      'new_end_date', new_end_date
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Competição atualizada com sucesso'
  );
END;
$function$;

-- Função para excluir competições agendadas
CREATE OR REPLACE FUNCTION public.delete_scheduled_competition(
  competition_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  config_record RECORD;
BEGIN
  -- Verificar se a competição existe e está agendada
  SELECT * INTO config_record 
  FROM weekly_config 
  WHERE id = competition_id AND status = 'scheduled';
  
  IF config_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Competição não encontrada ou não pode ser excluída'
    );
  END IF;
  
  -- Excluir a competição
  DELETE FROM weekly_config WHERE id = competition_id;
  
  -- Registrar no log de auditoria
  INSERT INTO automation_logs (
    automation_type,
    scheduled_time,
    executed_at,
    execution_status,
    affected_users,
    settings_snapshot
  ) VALUES (
    'competition_deletion',
    NOW(),
    NOW(),
    'completed',
    0,
    jsonb_build_object(
      'deleted_competition', config_record
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Competição excluída com sucesso'
  );
END;
$function$;

-- Função para atualizar data de fim de competição ativa
CREATE OR REPLACE FUNCTION public.update_active_competition_end_date(
  competition_id uuid,
  new_end_date date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  config_record RECORD;
BEGIN
  -- Verificar se a competição existe e está ativa
  SELECT * INTO config_record 
  FROM weekly_config 
  WHERE id = competition_id AND status = 'active';
  
  IF config_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Competição não encontrada ou não está ativa'
    );
  END IF;
  
  -- Validar que a nova data de fim é posterior ao início
  IF new_end_date <= config_record.start_date THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Data de fim deve ser posterior à data de início'
    );
  END IF;
  
  -- Validar que a nova data não é anterior à data atual
  IF new_end_date < current_date THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Data de fim não pode ser anterior à data atual'
    );
  END IF;
  
  -- Atualizar a competição
  UPDATE weekly_config
  SET 
    end_date = new_end_date,
    updated_at = NOW()
  WHERE id = competition_id;
  
  -- Registrar no log de auditoria
  INSERT INTO automation_logs (
    automation_type,
    scheduled_time,
    executed_at,
    execution_status,
    affected_users,
    settings_snapshot
  ) VALUES (
    'active_competition_update',
    NOW(),
    NOW(),
    'completed',
    0,
    jsonb_build_object(
      'competition_id', competition_id,
      'old_end_date', config_record.end_date,
      'new_end_date', new_end_date
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Data de fim da competição ativa atualizada com sucesso'
  );
END;
$function$;

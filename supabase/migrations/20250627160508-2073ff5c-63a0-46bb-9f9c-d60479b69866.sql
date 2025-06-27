
-- Função para excluir competições finalizadas com validações de segurança
CREATE OR REPLACE FUNCTION public.delete_completed_competition(competition_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  config_record RECORD;
  days_since_completion INTEGER;
  snapshot_exists BOOLEAN;
  ranking_records_count INTEGER;
BEGIN
  -- Verificar se a competição existe e está finalizada
  SELECT * INTO config_record 
  FROM weekly_config 
  WHERE id = competition_id AND status = 'completed';
  
  IF config_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Competição não encontrada ou não está finalizada'
    );
  END IF;
  
  -- Calcular dias desde a finalização
  SELECT EXTRACT(DAY FROM (NOW() - config_record.completed_at))::INTEGER INTO days_since_completion;
  
  -- Não permitir exclusão de competições finalizadas há menos de 7 dias
  IF days_since_completion < 7 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Não é possível excluir competições finalizadas há menos de 7 dias'
    );
  END IF;
  
  -- Verificar se existe snapshot da competição
  SELECT EXISTS (
    SELECT 1 FROM weekly_competitions_snapshot 
    WHERE competition_id = competition_id
  ) INTO snapshot_exists;
  
  -- Contar registros de ranking relacionados
  SELECT COUNT(*) INTO ranking_records_count
  FROM weekly_rankings
  WHERE week_start = config_record.start_date AND week_end = config_record.end_date;
  
  -- Excluir dados relacionados em ordem (cascata manual)
  -- 1. Excluir rankings da competição
  DELETE FROM weekly_rankings 
  WHERE week_start = config_record.start_date AND week_end = config_record.end_date;
  
  -- 2. Excluir snapshot se existir
  DELETE FROM weekly_competitions_snapshot 
  WHERE competition_id = competition_id;
  
  -- 3. Excluir histórico de competição se existir
  DELETE FROM competition_history 
  WHERE competition_id = competition_id;
  
  -- 4. Excluir a configuração da competição
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
    'completed_competition_deletion',
    NOW(),
    NOW(),
    'completed',
    ranking_records_count,
    jsonb_build_object(
      'deleted_competition', config_record,
      'had_snapshot', snapshot_exists,
      'ranking_records_deleted', ranking_records_count,
      'days_since_completion', days_since_completion
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Competição finalizada excluída com sucesso',
    'deleted_data', jsonb_build_object(
      'competition_id', competition_id,
      'ranking_records_deleted', ranking_records_count,
      'snapshot_deleted', snapshot_exists,
      'days_since_completion', days_since_completion
    )
  );
END;
$function$;

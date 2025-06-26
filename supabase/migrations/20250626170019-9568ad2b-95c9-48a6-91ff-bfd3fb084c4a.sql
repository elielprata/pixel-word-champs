
-- Corrigir função do cron job para usar horário de Brasília na comparação
CREATE OR REPLACE FUNCTION public.update_daily_competitions_status()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_utc TIMESTAMP WITH TIME ZONE;
  current_brasilia TIMESTAMP WITH TIME ZONE;
  updated_count INTEGER := 0;
  competitions_updated jsonb := '[]'::jsonb;
  comp_record RECORD;
BEGIN
  -- Obter horário UTC atual
  current_utc := NOW();
  
  -- Converter para horário de Brasília para comparações
  current_brasilia := current_utc AT TIME ZONE 'America/Sao_Paulo';
  
  RAISE NOTICE 'Iniciando atualização de status de competições diárias às % UTC (% Brasília)', 
    current_utc, current_brasilia;
  
  -- Buscar todas as competições diárias
  FOR comp_record IN 
    SELECT id, title, start_date, end_date, status, competition_type
    FROM custom_competitions 
    WHERE competition_type = 'challenge'
  LOOP
    DECLARE
      correct_status TEXT;
      old_status TEXT := comp_record.status;
      start_brasilia TIMESTAMP WITH TIME ZONE;
      end_brasilia TIMESTAMP WITH TIME ZONE;
    BEGIN
      -- Converter datas UTC para Brasília para comparação
      start_brasilia := comp_record.start_date AT TIME ZONE 'America/Sao_Paulo';
      end_brasilia := comp_record.end_date AT TIME ZONE 'America/Sao_Paulo';
      
      -- Calcular status correto baseado no horário de Brasília
      IF current_brasilia < start_brasilia THEN
        correct_status := 'scheduled';
      ELSIF current_brasilia >= start_brasilia AND current_brasilia < end_brasilia THEN
        correct_status := 'active';
      ELSE
        correct_status := 'completed';
      END IF;
      
      -- Atualizar apenas se o status mudou
      IF old_status != correct_status THEN
        UPDATE custom_competitions 
        SET status = correct_status, updated_at = current_utc
        WHERE id = comp_record.id;
        
        updated_count := updated_count + 1;
        
        -- Adicionar aos resultados
        competitions_updated := competitions_updated || jsonb_build_object(
          'id', comp_record.id,
          'title', comp_record.title,
          'old_status', old_status,
          'new_status', correct_status,
          'start_date_brasilia', start_brasilia,
          'end_date_brasilia', end_brasilia,
          'current_time_brasilia', current_brasilia
        );
        
        RAISE NOTICE 'Competição % (%) atualizada: % -> % (Brasília: %, Início: %, Fim: %)', 
          comp_record.title, comp_record.id, old_status, correct_status,
          current_brasilia, start_brasilia, end_brasilia;
      END IF;
    END;
  END LOOP;
  
  RAISE NOTICE 'Atualização concluída: % competições atualizadas', updated_count;
  
  RETURN jsonb_build_object(
    'success', true,
    'updated_count', updated_count,
    'competitions_updated', competitions_updated,
    'executed_at_utc', current_utc,
    'executed_at_brasilia', current_brasilia
  );
END;
$function$;

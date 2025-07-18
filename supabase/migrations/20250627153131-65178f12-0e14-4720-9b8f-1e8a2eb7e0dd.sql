
-- Função para atualizar status de competições semanais
CREATE OR REPLACE FUNCTION public.update_weekly_competitions_status()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_date_local DATE;
  updated_count INTEGER := 0;
  competitions_updated jsonb := '[]'::jsonb;
  comp_record RECORD;
BEGIN
  -- Obter data atual
  current_date_local := CURRENT_DATE;
  
  RAISE NOTICE 'Iniciando atualização de status de competições semanais para data: %', current_date_local;
  
  -- Buscar todas as competições semanais
  FOR comp_record IN 
    SELECT id, start_date, end_date, status
    FROM weekly_config 
    WHERE status IN ('scheduled', 'active')
  LOOP
    DECLARE
      correct_status TEXT;
      old_status TEXT := comp_record.status;
    BEGIN
      -- Calcular status correto baseado na data atual
      IF current_date_local < comp_record.start_date THEN
        correct_status := 'scheduled';
      ELSIF current_date_local >= comp_record.start_date AND current_date_local <= comp_record.end_date THEN
        correct_status := 'active';
      ELSE
        correct_status := 'completed';
      END IF;
      
      -- Atualizar apenas se o status mudou
      IF old_status != correct_status THEN
        UPDATE weekly_config 
        SET 
          status = correct_status,
          updated_at = NOW(),
          activated_at = CASE WHEN correct_status = 'active' AND old_status = 'scheduled' THEN NOW() ELSE activated_at END,
          completed_at = CASE WHEN correct_status = 'completed' AND old_status = 'active' THEN NOW() ELSE completed_at END
        WHERE id = comp_record.id;
        
        updated_count := updated_count + 1;
        
        -- Adicionar aos resultados
        competitions_updated := competitions_updated || jsonb_build_object(
          'id', comp_record.id,
          'old_status', old_status,
          'new_status', correct_status,
          'start_date', comp_record.start_date,
          'end_date', comp_record.end_date,
          'current_date', current_date_local
        );
        
        RAISE NOTICE 'Competição % atualizada: % -> % (Data atual: %, Período: % a %)', 
          comp_record.id, old_status, correct_status,
          current_date_local, comp_record.start_date, comp_record.end_date;
      END IF;
    END;
  END LOOP;
  
  -- Se alguma competição foi ativada, atualizar o ranking
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
$function$;

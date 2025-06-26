
-- Função para atualizar status de competições diárias baseado no horário atual
CREATE OR REPLACE FUNCTION public.update_daily_competitions_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_utc TIMESTAMP WITH TIME ZONE;
  updated_count INTEGER := 0;
  competitions_updated jsonb := '[]'::jsonb;
  comp_record RECORD;
BEGIN
  -- Usar UTC simples para comparações
  current_utc := NOW();
  
  RAISE NOTICE 'Iniciando atualização de status de competições diárias às %', current_utc;
  
  -- Buscar todas as competições diárias
  FOR comp_record IN 
    SELECT id, title, start_date, end_date, status, competition_type
    FROM custom_competitions 
    WHERE competition_type = 'challenge'
  LOOP
    DECLARE
      correct_status TEXT;
      old_status TEXT := comp_record.status;
    BEGIN
      -- Calcular status correto baseado no horário atual
      IF current_utc < comp_record.start_date THEN
        correct_status := 'scheduled';
      ELSIF current_utc >= comp_record.start_date AND current_utc < comp_record.end_date THEN
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
          'start_date', comp_record.start_date,
          'end_date', comp_record.end_date
        );
        
        RAISE NOTICE 'Competição % (%) atualizada: % -> %', 
          comp_record.title, comp_record.id, old_status, correct_status;
      END IF;
    END;
  END LOOP;
  
  RAISE NOTICE 'Atualização concluída: % competições atualizadas', updated_count;
  
  RETURN jsonb_build_object(
    'success', true,
    'updated_count', updated_count,
    'competitions_updated', competitions_updated,
    'executed_at', current_utc
  );
END;
$$;

-- Criar cron job para executar a função a cada 5 minutos
SELECT cron.schedule(
  'daily-competitions-status-update',
  '*/5 * * * *', -- A cada 5 minutos
  $$
  SELECT public.update_daily_competitions_status();
  $$
);

-- Executar uma vez imediatamente para corrigir os status atuais
SELECT public.update_daily_competitions_status();


-- Remover o cron job de competições semanais se existir
DO $$
BEGIN
  BEGIN
    PERFORM cron.unschedule('weekly-competitions-status-update');
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Cron job weekly-competitions-status-update não encontrado ou já removido';
  END;
END $$;

-- Verificar se há outros jobs relacionados a competições semanais e removê-los
DO $$
DECLARE
  job_record RECORD;
BEGIN
  FOR job_record IN 
    SELECT jobid, jobname 
    FROM cron.job 
    WHERE jobname LIKE '%weekly%' OR command LIKE '%weekly_competitions%'
  LOOP
    BEGIN
      PERFORM cron.unschedule(job_record.jobname);
      RAISE NOTICE 'Removido cron job: %', job_record.jobname;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao remover job %: %', job_record.jobname, SQLERRM;
    END;
  END LOOP;
END $$;

-- Comentário sobre a remoção
COMMENT ON FUNCTION public.update_weekly_competitions_status() IS 'Função mantida para ativação manual apenas - sem execução automática via cron';

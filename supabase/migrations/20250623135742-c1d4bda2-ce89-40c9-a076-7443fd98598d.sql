
-- Remover o cron job ativo que está causando execuções desnecessárias
SELECT cron.unschedule('check-automation-reset');

-- Verificar se existe algum job com ID 2 e removê-lo também
DO $$
BEGIN
  BEGIN
    PERFORM cron.unschedule(2);
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Job com ID 2 não encontrado ou já removido';
  END;
END $$;

-- Verificar jobs restantes (apenas para log)
SELECT jobid, jobname, schedule, command 
FROM cron.job 
WHERE jobname LIKE '%automation%' OR jobname LIKE '%reset%';


-- Corrigir sistema de triggers automáticos para ranking semanal
-- Garantir que o ranking seja atualizado automaticamente quando pontuações mudarem

-- 1. Primeiro, executar a função uma vez para corrigir dados existentes com premiação correta
SELECT update_weekly_ranking();

-- 2. Remover trigger antigo se existir
DROP TRIGGER IF EXISTS trigger_weekly_ranking_update ON profiles;

-- 3. Criar trigger atualizado que funciona corretamente
CREATE OR REPLACE FUNCTION public.trigger_weekly_ranking_update_v2()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Só atualizar se a pontuação realmente mudou
  IF OLD.total_score IS DISTINCT FROM NEW.total_score THEN
    -- Executar update_weekly_ranking de forma assíncrona para não bloquear
    PERFORM pg_notify('weekly_ranking_needs_update', json_build_object(
      'user_id', NEW.id,
      'old_score', OLD.total_score,
      'new_score', NEW.total_score,
      'timestamp', extract(epoch from now())
    )::text);
    
    -- Também executar imediatamente para garantir consistência
    PERFORM update_weekly_ranking();
    
    RAISE NOTICE 'Ranking semanal atualizado automaticamente devido a mudança de pontuação do usuário % (% -> %)', 
      NEW.id, OLD.total_score, NEW.total_score;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 4. Aplicar o novo trigger
CREATE TRIGGER trigger_weekly_ranking_update_v2
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_weekly_ranking_update_v2();

-- 5. Criar trigger para atualizações nas configurações de prêmios
CREATE OR REPLACE FUNCTION public.trigger_prize_config_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Quando configurações de prêmio mudarem, atualizar ranking para aplicar novas premiações
  PERFORM update_weekly_ranking();
  
  RAISE NOTICE 'Ranking semanal atualizado devido a mudança nas configurações de prêmio';
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 6. Aplicar trigger nas configurações de prêmio
DROP TRIGGER IF EXISTS trigger_prize_config_update ON prize_configurations;
CREATE TRIGGER trigger_prize_config_update
  AFTER INSERT OR UPDATE OR DELETE ON prize_configurations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_prize_config_update();

-- 7. Log da correção
INSERT INTO automation_logs (
  automation_type,
  scheduled_time,
  executed_at,
  execution_status,
  affected_users,
  settings_snapshot
) VALUES (
  'automatic_ranking_system_fix',
  NOW(),
  NOW(),
  'completed',
  0,
  jsonb_build_object(
    'action', 'recreated_automatic_triggers_for_weekly_ranking',
    'triggers_created', ARRAY['trigger_weekly_ranking_update_v2', 'trigger_prize_config_update'],
    'description', 'Sistema agora atualiza ranking automaticamente quando pontuações ou configurações de prêmio mudarem'
  )
);

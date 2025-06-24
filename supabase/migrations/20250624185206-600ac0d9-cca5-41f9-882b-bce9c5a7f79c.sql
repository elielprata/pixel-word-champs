
-- FASE 2: PREVENÇÃO DE DUPLICAÇÕES FUTURAS

-- 1. Criar constraint UNIQUE para evitar duplicatas na weekly_rankings
-- Garantir que não pode haver múltiplos registros para o mesmo usuário na mesma semana
ALTER TABLE weekly_rankings 
ADD CONSTRAINT unique_user_week 
UNIQUE (user_id, week_start, week_end);

-- 2. Criar índice para otimizar consultas frequentes
CREATE INDEX IF NOT EXISTS idx_weekly_rankings_week_position 
ON weekly_rankings (week_start, position);

-- 3. Melhorar a função update_weekly_ranking para ser mais robusta
CREATE OR REPLACE FUNCTION public.update_weekly_ranking()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  week_start_date DATE;
  week_end_date DATE;
  affected_rows INTEGER;
  config_record RECORD;
BEGIN
  -- Log de início
  RAISE NOTICE 'Iniciando atualização robusta do ranking semanal';
  
  -- Buscar configuração ativa
  SELECT * INTO config_record 
  FROM weekly_config 
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Se não houver configuração, usar padrão (domingo a sábado)
  IF config_record IS NULL THEN
    week_start_date := DATE_TRUNC('week', CURRENT_DATE)::DATE;
    week_end_date := week_start_date + INTERVAL '6 days';
  ELSIF config_record.custom_start_date IS NOT NULL AND config_record.custom_end_date IS NOT NULL THEN
    -- Usar datas específicas
    week_start_date := config_record.custom_start_date;
    week_end_date := config_record.custom_end_date;
  ELSE
    -- Calcular baseado no dia da semana e duração
    week_start_date := date_trunc('week', current_date)::date + (config_record.start_day_of_week || ' days')::interval;
    
    -- Ajustar se a semana calculada está no futuro
    IF week_start_date > current_date THEN
      week_start_date := week_start_date - interval '7 days';
    END IF;
    
    week_end_date := week_start_date + (config_record.duration_days - 1 || ' days')::interval;
  END IF;
  
  RAISE NOTICE 'Semana: % a %', week_start_date, week_end_date;
  
  -- USAR UPSERT ao invés de DELETE + INSERT para evitar duplicatas
  -- Primeiro, atualizar registros existentes ou inserir novos
  WITH ranked_users AS (
    SELECT 
      p.id as user_id,
      p.username,
      p.pix_key,
      p.pix_holder_name,
      ROW_NUMBER() OVER (ORDER BY COALESCE(p.total_score, 0) DESC) as position,
      COALESCE(p.total_score, 0) as score
    FROM profiles p
    WHERE COALESCE(p.total_score, 0) > 0
  ),
  prize_calculation AS (
    SELECT 
      user_id,
      username,
      pix_key,
      pix_holder_name,
      position,
      score,
      CASE 
        WHEN position = 1 THEN 100.00
        WHEN position = 2 THEN 50.00
        WHEN position = 3 THEN 25.00
        WHEN position <= 10 THEN 10.00
        ELSE 0
      END as prize_amount,
      CASE 
        WHEN position <= 10 THEN 'pending'
        ELSE 'not_eligible'
      END as payment_status
    FROM ranked_users
  )
  INSERT INTO weekly_rankings (
    user_id, username, pix_key, pix_holder_name,
    week_start, week_end, position, total_score, 
    prize_amount, payment_status, created_at, updated_at
  )
  SELECT 
    user_id, username, pix_key, pix_holder_name,
    week_start_date, week_end_date, position, score,
    prize_amount, payment_status, NOW(), NOW()
  FROM prize_calculation
  ON CONFLICT (user_id, week_start, week_end) 
  DO UPDATE SET
    username = EXCLUDED.username,
    pix_key = EXCLUDED.pix_key,
    pix_holder_name = EXCLUDED.pix_holder_name,
    position = EXCLUDED.position,
    total_score = EXCLUDED.total_score,
    prize_amount = EXCLUDED.prize_amount,
    payment_status = EXCLUDED.payment_status,
    updated_at = NOW();
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE 'Processados % registros no ranking (upsert)', affected_rows;
  
  -- Remover usuários que não deveriam mais estar no ranking (score = 0)
  DELETE FROM weekly_rankings wr
  WHERE week_start = week_start_date 
    AND week_end = week_end_date
    AND NOT EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = wr.user_id AND COALESCE(p.total_score, 0) > 0
    );
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE 'Removidos % registros obsoletos do ranking', affected_rows;
  
  RAISE NOTICE 'Atualização robusta do ranking semanal concluída com sucesso';
END;
$function$;

-- 4. Criar função para limpeza automática de registros órfãos
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_rankings()
 RETURNS INTEGER
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Remove registros de ranking para usuários que não existem mais
  DELETE FROM weekly_rankings wr
  WHERE NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = wr.user_id
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  IF deleted_count > 0 THEN
    RAISE NOTICE 'Removidos % registros órfãos do ranking', deleted_count;
  END IF;
  
  RETURN deleted_count;
END;
$function$;

-- 5. Criar trigger para evitar inserções diretas problemáticas
CREATE OR REPLACE FUNCTION public.validate_weekly_ranking_insert()
 RETURNS TRIGGER
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Verificar se o usuário existe
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.user_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado: %', NEW.user_id;
  END IF;
  
  -- Verificar se as datas fazem sentido
  IF NEW.week_start > NEW.week_end THEN
    RAISE EXCEPTION 'Data de início não pode ser posterior à data de fim';
  END IF;
  
  -- Garantir que updated_at seja sempre atual
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$function$;

-- Aplicar o trigger
DROP TRIGGER IF EXISTS validate_weekly_ranking_trigger ON weekly_rankings;
CREATE TRIGGER validate_weekly_ranking_trigger
  BEFORE INSERT OR UPDATE ON weekly_rankings
  FOR EACH ROW
  EXECUTE FUNCTION validate_weekly_ranking_insert();

-- 6. Log de conclusão da Fase 2
SELECT 'FASE 2 CONCLUÍDA: Sistema protegido contra duplicações futuras' as status;

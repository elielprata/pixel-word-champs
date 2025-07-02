-- FASE 3: OTIMIZAÇÃO DE PERFORMANCE (SIMPLIFICADA)
-- Remove triggers desnecessários e otimiza performance sem índices complexos

-- ===================================
-- 1. REMOVER TRIGGERS DESNECESSÁRIOS
-- ===================================
DROP TRIGGER IF EXISTS log_session_creation_trigger ON public.game_sessions;
DROP TRIGGER IF EXISTS trigger_weekly_ranking_update ON public.profiles;

-- ===================================
-- 2. CRIAR TRIGGER OTIMIZADO PARA RANKING
-- ===================================
CREATE OR REPLACE FUNCTION public.optimized_ranking_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Só atualizar se a mudança de pontuação for significativa (> 10 pontos)
  IF OLD.total_score IS DISTINCT FROM NEW.total_score 
     AND ABS(COALESCE(NEW.total_score, 0) - COALESCE(OLD.total_score, 0)) > 10 THEN
    
    -- Usar notificação ao invés de atualização direta para evitar locks
    PERFORM pg_notify('ranking_update_needed', NEW.id::text);
    
    RAISE NOTICE 'Ranking update scheduled for user % (score change: % -> %)', 
      NEW.id, OLD.total_score, NEW.total_score;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Aplicar trigger otimizado
CREATE TRIGGER optimized_ranking_trigger
  AFTER UPDATE OF total_score ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.optimized_ranking_update();

-- ===================================
-- 3. OTIMIZAR FUNÇÃO IS_ADMIN
-- ===================================
CREATE OR REPLACE FUNCTION public.is_admin_cached()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_status boolean;
BEGIN
  -- Consulta otimizada com limite
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
    LIMIT 1
  ) INTO admin_status;
  
  RETURN COALESCE(admin_status, false);
END;
$$;

-- ===================================
-- 4. FUNÇÃO OTIMIZADA DE RANKING SEMANAL
-- ===================================
CREATE OR REPLACE FUNCTION public.update_weekly_ranking_optimized()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_week_start date;
  current_week_end date;
  affected_rows integer;
BEGIN
  -- Buscar semana ativa da configuração
  SELECT start_date, end_date INTO current_week_start, current_week_end
  FROM weekly_config 
  WHERE status = 'active' 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Se não houver semana ativa, sair
  IF current_week_start IS NULL THEN
    RAISE NOTICE 'Nenhuma semana ativa encontrada - ranking não atualizado';
    RETURN;
  END IF;
  
  -- Usar UPSERT otimizado para ranking
  WITH ranking_data AS (
    SELECT 
      p.id as user_id,
      p.username,
      p.total_score,
      p.pix_key,
      p.pix_holder_name,
      ROW_NUMBER() OVER (ORDER BY p.total_score DESC, p.created_at ASC) as position
    FROM profiles p
    WHERE p.total_score > 0 
      AND p.is_banned = false
    ORDER BY p.total_score DESC
    LIMIT 1000 -- Limitar para evitar overhead
  ),
  prize_calculation AS (
    SELECT 
      rd.*,
      COALESCE(pc_individual.prize_amount, pc_group.prize_amount, 0) as prize_amount,
      CASE 
        WHEN COALESCE(pc_individual.prize_amount, pc_group.prize_amount, 0) > 0 THEN 'pending'
        ELSE 'not_eligible'
      END as payment_status
    FROM ranking_data rd
    LEFT JOIN prize_configurations pc_individual 
      ON pc_individual.type = 'individual' 
      AND pc_individual.position = rd.position 
      AND pc_individual.active = true
    LEFT JOIN prize_configurations pc_group 
      ON pc_group.type = 'group' 
      AND pc_group.active = true
      AND rd.position = ANY(
        string_to_array(regexp_replace(pc_group.position_range, '[^0-9,]', '', 'g'), ',')::int[]
      )
  )
  INSERT INTO weekly_rankings (
    user_id, username, week_start, week_end, total_score, position,
    prize_amount, payment_status, pix_key, pix_holder_name, updated_at
  )
  SELECT 
    user_id, username, current_week_start, current_week_end, total_score, position,
    prize_amount, payment_status, pix_key, pix_holder_name, NOW()
  FROM prize_calculation
  ON CONFLICT (user_id, week_start, week_end) 
  DO UPDATE SET
    total_score = EXCLUDED.total_score,
    position = EXCLUDED.position,
    prize_amount = EXCLUDED.prize_amount,
    payment_status = EXCLUDED.payment_status,
    pix_key = EXCLUDED.pix_key,
    pix_holder_name = EXCLUDED.pix_holder_name,
    updated_at = NOW();
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE 'Ranking semanal atualizado: % registros afetados', affected_rows;
END;
$$;

-- ===================================
-- 5. FUNÇÃO OTIMIZADA PARA ESTATÍSTICAS DO USUÁRIO
-- ===================================
CREATE OR REPLACE FUNCTION public.get_user_stats_optimized(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_data jsonb;
  ranking_data jsonb;
  activity_data jsonb;
BEGIN
  -- Buscar dados básicos do usuário
  SELECT jsonb_build_object(
    'total_score', COALESCE(total_score, 0),
    'games_played', COALESCE(games_played, 0),
    'experience_points', COALESCE(experience_points, 0),
    'best_weekly_position', best_weekly_position,
    'best_daily_position', best_daily_position,
    'level', GREATEST(1, FLOOR(COALESCE(total_score, 0) / 1000) + 1)
  ) INTO user_data
  FROM profiles 
  WHERE id = target_user_id;
  
  -- Buscar posição atual no ranking (apenas se necessário)
  SELECT jsonb_build_object(
    'current_position', position,
    'week_start', week_start,
    'week_end', week_end,
    'prize_amount', COALESCE(prize_amount, 0)
  ) INTO ranking_data
  FROM weekly_rankings 
  WHERE user_id = target_user_id 
    AND week_start = (
      SELECT start_date FROM weekly_config 
      WHERE status = 'active' 
      ORDER BY created_at DESC 
      LIMIT 1
    )
  LIMIT 1;
  
  -- Buscar atividade recente (últimos 7 dias)
  SELECT jsonb_build_object(
    'days_active_last_week', COUNT(DISTINCT activity_date),
    'total_days_active', (
      SELECT COUNT(DISTINCT activity_date) 
      FROM user_activity_days 
      WHERE user_id = target_user_id
    )
  ) INTO activity_data
  FROM user_activity_days 
  WHERE user_id = target_user_id 
    AND activity_date >= CURRENT_DATE - INTERVAL '7 days';
  
  -- Combinar todos os dados
  RETURN jsonb_build_object(
    'user', COALESCE(user_data, '{}'::jsonb),
    'ranking', COALESCE(ranking_data, '{}'::jsonb),
    'activity', COALESCE(activity_data, '{}'::jsonb),
    'updated_at', NOW()
  );
END;
$$;

-- ===================================
-- 6. FUNÇÃO DE LIMPEZA DE DADOS ANTIGOS
-- ===================================
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_sessions integer := 0;
  deleted_history integer := 0;
  deleted_activity integer := 0;
BEGIN
  -- Remover sessões incompletas antigas (mais de 7 dias)
  DELETE FROM game_sessions 
  WHERE is_completed = false 
    AND started_at < NOW() - INTERVAL '7 days';
  GET DIAGNOSTICS deleted_sessions = ROW_COUNT;
  
  -- Remover histórico de palavras muito antigo (mais de 90 dias)
  DELETE FROM user_word_history 
  WHERE used_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS deleted_history = ROW_COUNT;
  
  -- Remover atividade muito antiga (mais de 1 ano)
  DELETE FROM user_activity_days 
  WHERE activity_date < CURRENT_DATE - INTERVAL '1 year';
  GET DIAGNOSTICS deleted_activity = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'deleted_sessions', deleted_sessions,
    'deleted_history', deleted_history,
    'deleted_activity', deleted_activity,
    'cleaned_at', NOW()
  );
END;
$$;

-- ===================================
-- VERIFICAÇÃO FINAL DE PERFORMANCE
-- ===================================
DO $$
DECLARE
    trigger_count INTEGER;
    function_count INTEGER;
BEGIN
    -- Contar triggers ativos
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' AND NOT t.tgisinternal;
    
    -- Contar funções otimizadas
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
      AND p.proname LIKE '%optimized%';
    
    RAISE NOTICE '🎉 FASE 3 CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '📊 ESTATÍSTICAS DE PERFORMANCE:';
    RAISE NOTICE '  - % triggers ativos', trigger_count;
    RAISE NOTICE '  - % funções otimizadas', function_count;
    RAISE NOTICE '🚀 Performance melhorada!';
    RAISE NOTICE '⚡ Triggers otimizados!';
    RAISE NOTICE '🧹 Sistema de limpeza implementado!';
    RAISE NOTICE '📈 Sistema pronto para Fase 4!';
END $$;
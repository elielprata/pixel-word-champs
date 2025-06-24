
-- ETAPA 1: PREPARAÇÃO E MIGRAÇÃO DE DADOS
-- Migração do sistema de Competições Semanais para Ranking Semanal

-- 1. Criar tabela de backup para preservar dados históricos das competições semanais
CREATE TABLE IF NOT EXISTS public.weekly_competitions_backup AS 
SELECT * FROM public.custom_competitions 
WHERE competition_type = 'tournament';

-- 2. Migrar dados históricos das competições semanais para competition_history
INSERT INTO public.competition_history (
  competition_id,
  user_id, 
  final_score,
  final_position,
  total_participants,
  prize_earned,
  competition_start_date,
  competition_end_date,
  finalized_at,
  competition_title,
  competition_type
)
SELECT 
  cp.competition_id,
  cp.user_id,
  cp.user_score as final_score,
  cp.user_position as final_position,
  (SELECT COUNT(*) FROM competition_participations cp2 WHERE cp2.competition_id = cp.competition_id) as total_participants,
  COALESCE(cp.prize, 0) as prize_earned,
  cc.start_date as competition_start_date,
  cc.end_date as competition_end_date,
  COALESCE(cc.updated_at, cc.created_at) as finalized_at,
  cc.title as competition_title,
  'weekly_tournament' as competition_type
FROM public.competition_participations cp
JOIN public.custom_competitions cc ON cp.competition_id = cc.id
WHERE cc.competition_type = 'tournament' 
  AND cc.status = 'completed'
  AND NOT EXISTS (
    SELECT 1 FROM public.competition_history ch 
    WHERE ch.competition_id = cp.competition_id AND ch.user_id = cp.user_id
  );

-- 3. Remover competições semanais antigas da tabela custom_competitions
-- (mantemos apenas as competições diárias)
DELETE FROM public.custom_competitions 
WHERE competition_type = 'tournament';

-- 4. Atualizar constraint para aceitar apenas 'challenge' como competition_type
-- Primeiro, verificar se existem outros tipos além de 'challenge'
DO $$
BEGIN
  -- Verificar se ainda existem registros com 'tournament'
  IF EXISTS (SELECT 1 FROM custom_competitions WHERE competition_type = 'tournament') THEN
    RAISE EXCEPTION 'Ainda existem competições do tipo tournament. Migração incompleta.';
  END IF;
END $$;

-- 5. Criar índices otimizados para o sistema de ranking semanal
CREATE INDEX IF NOT EXISTS idx_weekly_rankings_week_position 
ON public.weekly_rankings(week_start, week_end, position);

CREATE INDEX IF NOT EXISTS idx_weekly_rankings_user_week 
ON public.weekly_rankings(user_id, week_start);

CREATE INDEX IF NOT EXISTS idx_profiles_total_score 
ON public.profiles(total_score DESC) WHERE total_score > 0;

-- 6. Otimizar tabela de histórico de competições
CREATE INDEX IF NOT EXISTS idx_competition_history_user_finalized 
ON public.competition_history(user_id, finalized_at DESC);

CREATE INDEX IF NOT EXISTS idx_competition_history_type_finalized 
ON public.competition_history(competition_type, finalized_at DESC);

-- 7. Função para migrar dados de prêmios das competições antigas para prize_distributions
CREATE OR REPLACE FUNCTION migrate_weekly_competition_prizes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Migrar prêmios das competições semanais para prize_distributions
  INSERT INTO prize_distributions (
    user_id,
    competition_id,
    prize_amount,
    position,
    ranking_type,
    payment_status,
    pix_key,
    pix_holder_name,
    created_at
  )
  SELECT DISTINCT
    cp.user_id,
    cp.competition_id,
    COALESCE(cp.prize, 0) as prize_amount,
    cp.user_position as position,
    'weekly' as ranking_type,
    COALESCE(cp.payment_status::text, 'pending') as payment_status,
    p.pix_key,
    p.pix_holder_name,
    cp.created_at
  FROM competition_participations cp
  JOIN profiles p ON cp.user_id = p.id
  JOIN weekly_competitions_backup wcb ON cp.competition_id = wcb.id
  WHERE cp.prize > 0
    AND NOT EXISTS (
      SELECT 1 FROM prize_distributions pd 
      WHERE pd.user_id = cp.user_id 
        AND pd.competition_id = cp.competition_id
    );
    
  RAISE NOTICE 'Migração de prêmios concluída';
END;
$$;

-- Executar a migração de prêmios
SELECT migrate_weekly_competition_prizes();

-- 8. Limpar tabelas que não são mais necessárias para competições semanais
-- Manter apenas participações de competições diárias
DELETE FROM public.competition_participations 
WHERE competition_id IN (
  SELECT id FROM weekly_competitions_backup
);

-- 9. Atualizar configurações do sistema para refletir a mudança
UPDATE public.game_settings 
SET setting_value = 'false'
WHERE setting_key = 'weekly_competitions_enabled';

INSERT INTO public.game_settings (setting_key, setting_value, setting_type, description, category)
VALUES (
  'weekly_ranking_enabled', 
  'true', 
  'boolean', 
  'Sistema de ranking semanal automático ativo',
  'ranking'
) ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = 'true',
  updated_at = now();

-- 10. Criar função para monitoramento do ranking semanal
CREATE OR REPLACE FUNCTION get_weekly_ranking_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_week_start date;
  current_week_end date;
  stats jsonb;
BEGIN
  -- Calcular semana atual
  current_week_start := date_trunc('week', current_date)::date;
  current_week_end := current_week_start + interval '6 days';
  
  -- Compilar estatísticas
  SELECT jsonb_build_object(
    'current_week_start', current_week_start,
    'current_week_end', current_week_end,
    'total_participants', (
      SELECT count(*) FROM profiles WHERE total_score > 0
    ),
    'total_prize_pool', (
      SELECT sum(prize_amount) FROM weekly_rankings 
      WHERE week_start = current_week_start
    ),
    'last_update', (
      SELECT max(updated_at) FROM weekly_rankings 
      WHERE week_start = current_week_start
    ),
    'top_3_players', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'username', username,
          'score', total_score,
          'position', position,
          'prize', prize_amount
        )
      )
      FROM weekly_rankings 
      WHERE week_start = current_week_start 
        AND position <= 3
      ORDER BY position
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$;

-- Log da migração
INSERT INTO admin_actions (admin_id, target_user_id, action_type, details)
SELECT 
  (SELECT id FROM profiles LIMIT 1), -- Admin que executou
  (SELECT id FROM profiles LIMIT 1), -- Sistema
  'system_migration',
  jsonb_build_object(
    'migration_type', 'weekly_competitions_to_ranking',
    'executed_at', now(),
    'backup_table_created', 'weekly_competitions_backup',
    'records_migrated', (SELECT count(*) FROM weekly_competitions_backup)
  );

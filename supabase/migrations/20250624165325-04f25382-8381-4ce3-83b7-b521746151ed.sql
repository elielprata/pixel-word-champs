
-- Limpeza completa do sistema - Remoção de competições semanais
-- Fase 1: Limpeza de database e configurações

-- 1. Remover configurações obsoletas do sistema
DELETE FROM public.game_settings 
WHERE setting_key IN (
  'weekly_competitions_enabled',
  'weekly_competition_auto_create',
  'weekly_competition_duration'
);

-- 2. Limpar participações órfãs de competições que não existem mais
DELETE FROM public.competition_participations 
WHERE competition_id NOT IN (
  SELECT id FROM public.custom_competitions
);

-- 3. Atualizar constraint para aceitar apenas 'challenge' como competition_type
-- (removendo qualquer referência a 'tournament' que ainda possa existir)
ALTER TABLE public.custom_competitions 
DROP CONSTRAINT IF EXISTS custom_competitions_competition_type_check;

ALTER TABLE public.custom_competitions 
ADD CONSTRAINT custom_competitions_competition_type_check 
CHECK (competition_type = 'challenge');

-- 4. Remover coluna weekly_tournament_id que não é mais necessária
ALTER TABLE public.custom_competitions 
DROP COLUMN IF EXISTS weekly_tournament_id;

-- 5. Garantir que todas as competições existentes sejam do tipo 'challenge'
UPDATE public.custom_competitions 
SET competition_type = 'challenge'
WHERE competition_type != 'challenge';

-- 6. Adicionar índice otimizado para competições diárias apenas
CREATE INDEX IF NOT EXISTS idx_custom_competitions_daily_active 
ON public.custom_competitions(competition_type, status, start_date) 
WHERE competition_type = 'challenge';

-- 7. Remover funções obsoletas relacionadas a competições semanais
DROP FUNCTION IF EXISTS public.migrate_weekly_competition_prizes();

-- 8. Atualizar configuração do sistema para refletir o novo modelo
INSERT INTO public.game_settings (setting_key, setting_value, setting_type, description, category)
VALUES (
  'system_mode', 
  'daily_competitions_weekly_ranking', 
  'string', 
  'Sistema simplificado: competições diárias + ranking semanal automático',
  'system'
) ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = 'daily_competitions_weekly_ranking',
  updated_at = now();

-- 9. Log da limpeza do sistema
INSERT INTO public.admin_actions (admin_id, target_user_id, action_type, details)
SELECT 
  (SELECT id FROM profiles WHERE id IN (SELECT user_id FROM user_roles WHERE role = 'admin') LIMIT 1),
  (SELECT id FROM profiles WHERE id IN (SELECT user_id FROM user_roles WHERE role = 'admin') LIMIT 1),
  'system_cleanup',
  jsonb_build_object(
    'cleanup_type', 'weekly_competitions_removal',
    'executed_at', now(),
    'system_simplified', true,
    'remaining_features', jsonb_build_array('daily_competitions', 'weekly_ranking')
  );

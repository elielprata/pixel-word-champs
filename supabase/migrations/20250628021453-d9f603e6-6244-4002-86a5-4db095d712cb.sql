
-- Adicionar campo phone à tabela profiles se não existir
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone character varying;

-- Criar tabela para pontos mensais de indicação (independente e com reset mensal)
CREATE TABLE IF NOT EXISTS public.monthly_invite_points (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month_year text NOT NULL, -- formato 'YYYY-MM'
  invite_points integer NOT NULL DEFAULT 0,
  invites_count integer NOT NULL DEFAULT 0,
  active_invites_count integer NOT NULL DEFAULT 0,
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_monthly_invite_points_user_month ON public.monthly_invite_points(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_monthly_invite_points_month ON public.monthly_invite_points(month_year);

-- Criar tabela para competições mensais de indicação
CREATE TABLE IF NOT EXISTS public.monthly_invite_competitions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month_year text NOT NULL UNIQUE, -- formato 'YYYY-MM'
  title text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('scheduled', 'active', 'completed')),
  total_participants integer NOT NULL DEFAULT 0,
  total_prize_pool numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone
);

-- Criar tabela para configuração de prêmios da competição de indicação
CREATE TABLE IF NOT EXISTS public.monthly_invite_prizes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id uuid NOT NULL REFERENCES monthly_invite_competitions(id) ON DELETE CASCADE,
  position integer NOT NULL,
  prize_amount numeric NOT NULL DEFAULT 0,
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela para ranking mensal de indicações
CREATE TABLE IF NOT EXISTS public.monthly_invite_rankings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id uuid NOT NULL REFERENCES monthly_invite_competitions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  username text NOT NULL,
  position integer NOT NULL,
  invite_points integer NOT NULL DEFAULT 0,
  invites_count integer NOT NULL DEFAULT 0,
  active_invites_count integer NOT NULL DEFAULT 0,
  prize_amount numeric NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'not_eligible' CHECK (payment_status IN ('not_eligible', 'pending', 'paid', 'failed')),
  pix_key text,
  pix_holder_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(competition_id, user_id)
);

-- Índices para otimizar consultas do ranking
CREATE INDEX IF NOT EXISTS idx_monthly_invite_rankings_competition ON public.monthly_invite_rankings(competition_id);
CREATE INDEX IF NOT EXISTS idx_monthly_invite_rankings_position ON public.monthly_invite_rankings(competition_id, position);

-- Função para atualizar pontos mensais de indicação
CREATE OR REPLACE FUNCTION public.update_monthly_invite_points(
  p_user_id uuid,
  p_points_to_add integer DEFAULT 50
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_month text;
BEGIN
  -- Obter mês/ano atual no formato YYYY-MM
  current_month := to_char(current_date, 'YYYY-MM');
  
  -- Inserir ou atualizar pontos mensais
  INSERT INTO monthly_invite_points (user_id, month_year, invite_points, invites_count)
  VALUES (p_user_id, current_month, p_points_to_add, 1)
  ON CONFLICT (user_id, month_year) 
  DO UPDATE SET 
    invite_points = monthly_invite_points.invite_points + p_points_to_add,
    invites_count = monthly_invite_points.invites_count + 1,
    last_updated = now();
    
  -- Atualizar contador de convites ativos se o convidado já jogou
  UPDATE monthly_invite_points 
  SET active_invites_count = (
    SELECT COUNT(*) 
    FROM invites i
    JOIN profiles p ON i.used_by = p.id
    WHERE i.invited_by = p_user_id 
      AND p.games_played > 0
      AND to_char(i.used_at, 'YYYY-MM') = current_month
  )
  WHERE user_id = p_user_id AND month_year = current_month;
  
  RAISE NOTICE 'Pontos mensais atualizados para usuário %: +% pontos', p_user_id, p_points_to_add;
END;
$$;

-- Atualizar trigger de recompensa de convites para incluir pontos mensais
CREATE OR REPLACE FUNCTION public.handle_invite_xp_reward()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Só executar se o convite foi usado (used_by passou de NULL para um UUID)
  IF OLD.used_by IS NULL AND NEW.used_by IS NOT NULL THEN
    
    -- Dar 50XP PERMANENTE para quem convidou
    UPDATE profiles 
    SET experience_points = COALESCE(experience_points, 0) + 50
    WHERE id = NEW.invited_by;
    
    -- Dar 50XP PERMANENTE para quem foi convidado
    UPDATE profiles 
    SET experience_points = COALESCE(experience_points, 0) + 50
    WHERE id = NEW.used_by;
    
    -- Atualizar pontos mensais de indicação (sistema separado)
    PERFORM update_monthly_invite_points(NEW.invited_by, 50);
    
    -- Registrar a recompensa no histórico
    INSERT INTO invite_rewards (user_id, invited_user_id, invite_code, reward_amount, status)
    VALUES (NEW.invited_by, NEW.used_by, NEW.code, 50, 'processed');
    
    RAISE NOTICE 'Recompensas processadas: XP permanente + pontos mensais para usuários % e %', NEW.invited_by, NEW.used_by;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Função para calcular ranking mensal de indicações
CREATE OR REPLACE FUNCTION public.calculate_monthly_invite_ranking(
  target_month text DEFAULT to_char(current_date, 'YYYY-MM')
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  competition_record RECORD;
  ranking_result jsonb;
BEGIN
  -- Buscar ou criar competição do mês
  SELECT * INTO competition_record
  FROM monthly_invite_competitions
  WHERE month_year = target_month;
  
  -- Se não existe, criar competição para o mês
  IF competition_record IS NULL THEN
    INSERT INTO monthly_invite_competitions (
      month_year, 
      title, 
      start_date, 
      end_date,
      status
    ) VALUES (
      target_month,
      'Competição de Indicações - ' || to_char(to_date(target_month, 'YYYY-MM'), 'Month YYYY'),
      date_trunc('month', to_date(target_month, 'YYYY-MM'))::date,
      (date_trunc('month', to_date(target_month, 'YYYY-MM')) + interval '1 month - 1 day')::date,
      CASE 
        WHEN target_month = to_char(current_date, 'YYYY-MM') THEN 'active'
        WHEN to_date(target_month, 'YYYY-MM') > current_date THEN 'scheduled'
        ELSE 'completed'
      END
    ) RETURNING * INTO competition_record;
  END IF;
  
  -- Atualizar ranking da competição
  WITH ranked_users AS (
    SELECT 
      p.id as user_id,
      p.username,
      COALESCE(mip.invite_points, 0) as invite_points,
      COALESCE(mip.invites_count, 0) as invites_count,
      COALESCE(mip.active_invites_count, 0) as active_invites_count,
      ROW_NUMBER() OVER (ORDER BY COALESCE(mip.invite_points, 0) DESC, COALESCE(mip.active_invites_count, 0) DESC) as position
    FROM profiles p
    LEFT JOIN monthly_invite_points mip ON p.id = mip.user_id AND mip.month_year = target_month
    WHERE COALESCE(mip.invite_points, 0) > 0
  )
  INSERT INTO monthly_invite_rankings (
    competition_id, user_id, username, position, 
    invite_points, invites_count, active_invites_count,
    prize_amount, payment_status
  )
  SELECT 
    competition_record.id,
    user_id,
    username,
    position,
    invite_points,
    invites_count,
    active_invites_count,
    0, -- prize_amount (será calculado depois com configuração de prêmios)
    'not_eligible'
  FROM ranked_users
  ON CONFLICT (competition_id, user_id) 
  DO UPDATE SET
    position = EXCLUDED.position,
    invite_points = EXCLUDED.invite_points,
    invites_count = EXCLUDED.invites_count,
    active_invites_count = EXCLUDED.active_invites_count,
    updated_at = now();
  
  -- Retornar resultado
  SELECT jsonb_build_object(
    'competition_id', competition_record.id,
    'month_year', target_month,
    'total_participants', (SELECT COUNT(*) FROM monthly_invite_rankings WHERE competition_id = competition_record.id),
    'updated_at', now()
  ) INTO ranking_result;
  
  RETURN ranking_result;
END;
$$;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.monthly_invite_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_invite_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_invite_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_invite_rankings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para monthly_invite_points (usuários podem ver seus próprios pontos)
CREATE POLICY "Users can view their own monthly invite points" 
  ON public.monthly_invite_points 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Políticas RLS para monthly_invite_competitions (público para leitura)
CREATE POLICY "Monthly invite competitions are publicly readable" 
  ON public.monthly_invite_competitions 
  FOR SELECT 
  USING (true);

-- Políticas RLS para monthly_invite_rankings (público para leitura)
CREATE POLICY "Monthly invite rankings are publicly readable" 
  ON public.monthly_invite_rankings 
  FOR SELECT 
  USING (true);

-- Políticas RLS para monthly_invite_prizes (público para leitura)
CREATE POLICY "Monthly invite prizes are publicly readable" 
  ON public.monthly_invite_prizes 
  FOR SELECT 
  USING (true);


-- Restaurar a estrutura original da tabela prize_configurations
DROP TABLE IF EXISTS public.prize_configurations CASCADE;

CREATE TABLE public.prize_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type character varying NOT NULL CHECK (type IN ('individual', 'group')),
  position integer,
  position_range character varying,
  group_name character varying,
  prize_amount numeric NOT NULL DEFAULT 0,
  total_winners integer NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Inserir dados iniciais de configuração de prêmios individuais
INSERT INTO public.prize_configurations (type, position, prize_amount, total_winners) VALUES
('individual', 1, 100.00, 1),
('individual', 2, 50.00, 1),
('individual', 3, 25.00, 1);

-- Inserir dados iniciais de configuração de prêmios em grupo
INSERT INTO public.prize_configurations (type, position_range, group_name, prize_amount, total_winners, active) VALUES
('group', '4-10', '4º ao 10º lugar', 10.00, 7, true),
('group', '11-50', '11º ao 50º lugar', 5.00, 40, false),
('group', '51-100', '51º ao 100º lugar', 2.50, 50, false);

-- Habilitar RLS
ALTER TABLE public.prize_configurations ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para todos os usuários autenticados
CREATE POLICY "prize_configurations_read" ON public.prize_configurations
  FOR SELECT
  USING (true);

-- Permitir escrita apenas para admins
CREATE POLICY "prize_configurations_write" ON public.prize_configurations
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

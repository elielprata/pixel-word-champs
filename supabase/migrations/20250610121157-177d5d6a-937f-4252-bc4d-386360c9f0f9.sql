
-- Adicionar a coluna payment_status à tabela weekly_rankings
ALTER TABLE public.weekly_rankings 
ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'not_eligible';

-- Adicionar a coluna payment_status à tabela competition_participations se não existir
ALTER TABLE public.competition_participations 
ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'pending';

-- Atualizar registros existentes para ter um status padrão
UPDATE public.weekly_rankings 
SET payment_status = CASE 
  WHEN position <= 10 THEN 'pending'::payment_status
  ELSE 'not_eligible'::payment_status
END
WHERE payment_status IS NULL;

UPDATE public.competition_participations 
SET payment_status = 'pending'::payment_status
WHERE payment_status IS NULL;


-- Verificar e corrigir o tipo payment_status
DO $$ BEGIN
    -- Criar o tipo payment_status se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'not_eligible');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Tipo já existe, não fazer nada
        NULL;
END $$;

-- Verificar e corrigir a coluna payment_status na tabela weekly_rankings
DO $$ BEGIN
    -- Verificar se a coluna existe e tem o tipo correto
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'weekly_rankings' 
        AND column_name = 'payment_status'
        AND data_type != 'USER-DEFINED'
    ) THEN
        -- Se existe mas não é do tipo correto, corrigir
        ALTER TABLE weekly_rankings 
        ALTER COLUMN payment_status TYPE payment_status 
        USING payment_status::text::payment_status;
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'weekly_rankings' 
        AND column_name = 'payment_status'
    ) THEN
        -- Se não existe, criar
        ALTER TABLE weekly_rankings 
        ADD COLUMN payment_status payment_status DEFAULT 'not_eligible';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao processar payment_status: %', SQLERRM;
END $$;

-- Verificar e corrigir a coluna payment_status na tabela competition_participations
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'competition_participations' 
        AND column_name = 'payment_status'
        AND data_type != 'USER-DEFINED'
    ) THEN
        ALTER TABLE competition_participations 
        ALTER COLUMN payment_status TYPE payment_status 
        USING payment_status::text::payment_status;
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'competition_participations' 
        AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE competition_participations 
        ADD COLUMN payment_status payment_status DEFAULT 'pending';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao processar payment_status em competition_participations: %', SQLERRM;
END $$;

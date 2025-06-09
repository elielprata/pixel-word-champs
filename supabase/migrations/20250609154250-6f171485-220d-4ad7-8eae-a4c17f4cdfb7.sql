
-- Criar o tipo enum payment_status se não existir
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'not_eligible');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Verificar se a tabela competition_participations tem a coluna payment_status com o tipo correto
DO $$ BEGIN
    -- Se a coluna existe mas tem tipo errado, vamos alterá-la
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'competition_participations' 
               AND column_name = 'payment_status') THEN
        -- Atualizar a coluna para usar o enum correto
        ALTER TABLE competition_participations 
        ALTER COLUMN payment_status TYPE payment_status 
        USING payment_status::text::payment_status;
    ELSE
        -- Se a coluna não existe, criá-la
        ALTER TABLE competition_participations 
        ADD COLUMN payment_status payment_status DEFAULT 'pending';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao processar payment_status: %', SQLERRM;
END $$;

-- Verificar se a tabela weekly_rankings tem a coluna payment_status com o tipo correto
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'weekly_rankings' 
               AND column_name = 'payment_status') THEN
        -- Atualizar a coluna para usar o enum correto
        ALTER TABLE weekly_rankings 
        ALTER COLUMN payment_status TYPE payment_status 
        USING payment_status::text::payment_status;
    ELSE
        -- Se a coluna não existe, criá-la
        ALTER TABLE weekly_rankings 
        ADD COLUMN payment_status payment_status DEFAULT 'not_eligible';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao processar payment_status em weekly_rankings: %', SQLERRM;
END $$;

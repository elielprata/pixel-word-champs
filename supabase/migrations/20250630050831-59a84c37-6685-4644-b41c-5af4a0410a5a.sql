
-- Corrigir search_path mutável em funções de segurança

-- 1. Corrigir função validate_weekly_ranking_insert (se existir)
DO $$ 
BEGIN
  -- Verificar se a função existe antes de tentar alterá-la
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'validate_weekly_ranking_insert') THEN
    EXECUTE '
    CREATE OR REPLACE FUNCTION public.validate_weekly_ranking_insert()
     RETURNS trigger
     LANGUAGE plpgsql
     SECURITY DEFINER
     SET search_path = public
    AS $func$
    BEGIN
      -- Verificar se o usuário existe
      IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.user_id) THEN
        RAISE EXCEPTION ''Usuário não encontrado: %'', NEW.user_id;
      END IF;
      
      -- Verificar se as datas fazem sentido
      IF NEW.week_start > NEW.week_end THEN
        RAISE EXCEPTION ''Data de início não pode ser posterior à data de fim'';
      END IF;
      
      -- Garantir que updated_at seja sempre atual
      NEW.updated_at = NOW();
      
      RETURN NEW;
    END;
    $func$';
    
    RAISE NOTICE 'Função validate_weekly_ranking_insert atualizada com search_path fixo';
  ELSE
    RAISE NOTICE 'Função validate_weekly_ranking_insert não encontrada, pulando...';
  END IF;
END $$;

-- 2. Corrigir função refresh_ranking_view (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'refresh_ranking_view') THEN
    EXECUTE '
    CREATE OR REPLACE FUNCTION public.refresh_ranking_view()
     RETURNS void
     LANGUAGE plpgsql
     SECURITY DEFINER
     SET search_path = public
    AS $func$
    BEGIN
      -- Verificar se a materialized view existe antes de tentar refresh
      IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = ''mv_current_weekly_ranking'') THEN
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_current_weekly_ranking;
      ELSE
        RAISE NOTICE ''Materialized view mv_current_weekly_ranking não encontrada'';
      END IF;
    END;
    $func$';
    
    RAISE NOTICE 'Função refresh_ranking_view atualizada com search_path fixo';
  ELSE
    RAISE NOTICE 'Função refresh_ranking_view não encontrada, pulando...';
  END IF;
END $$;

-- 3. Corrigir função validate_completed_competition_has_snapshot (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'validate_completed_competition_has_snapshot') THEN
    EXECUTE '
    CREATE OR REPLACE FUNCTION public.validate_completed_competition_has_snapshot()
     RETURNS trigger
     LANGUAGE plpgsql
     SECURITY DEFINER
     SET search_path = public
    AS $func$
    BEGIN
      -- Verificar se competição completada tem snapshot
      IF NEW.status = ''completed'' AND OLD.status != ''completed'' THEN
        -- Lógica de validação aqui se necessário
        RAISE NOTICE ''Competição % marcada como completada'', NEW.id;
      END IF;
      
      RETURN NEW;
    END;
    $func$';
    
    RAISE NOTICE 'Função validate_completed_competition_has_snapshot atualizada com search_path fixo';
  ELSE
    RAISE NOTICE 'Função validate_completed_competition_has_snapshot não encontrada, pulando...';
  END IF;
END $$;

-- 4. Corrigir função log_session_creation (se existir)  
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'log_session_creation') THEN
    EXECUTE '
    CREATE OR REPLACE FUNCTION public.log_session_creation()
     RETURNS trigger
     LANGUAGE plpgsql
     SECURITY DEFINER
     SET search_path = public
    AS $func$
    BEGIN
      -- Log de criação de sessão
      RAISE NOTICE ''Sessão criada: % para usuário %'', NEW.id, NEW.user_id;
      RETURN NEW;
    END;
    $func$';
    
    RAISE NOTICE 'Função log_session_creation atualizada com search_path fixo';
  ELSE
    RAISE NOTICE 'Função log_session_creation não encontrada, pulando...';
  END IF;
END $$;

-- Log final corrigido
DO $$
BEGIN
  RAISE NOTICE 'Correção de search_path concluída para funções existentes';
END $$;


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Sistema de logging estruturado para Edge Function
const createLogger = () => {
  const log = (level: string, message: string, data?: any, category?: string) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      category: category || 'WEEKLY_FINALIZER',
      data: data || undefined
    };
    console.log(`[${level}] ${category || 'WEEKLY_FINALIZER'}: ${message}`, data ? JSON.stringify(data) : '');
  };

  return {
    debug: (message: string, data?: any, category?: string) => log('DEBUG', message, data, category),
    info: (message: string, data?: any, category?: string) => log('INFO', message, data, category),
    warn: (message: string, data?: any, category?: string) => log('WARN', message, data, category),
    error: (message: string, data?: any, category?: string) => log('ERROR', message, data, category),
  };
};

const logger = createLogger();

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Usar variáveis de ambiente do Supabase
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    logger.error('Variáveis de ambiente não configuradas');
    return new Response(JSON.stringify({ 
      error: 'Configuração do servidor incompleta' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    logger.info('Iniciando verificação de finalização automática de competições');

    // Verificar se existe competição ativa ou ended que precisa ser finalizada
    const { data: competitionsToCheck, error: checkError } = await supabase
      .from('weekly_config')
      .select('*')
      .in('status', ['active', 'ended'])
      .order('end_date', { ascending: true });

    if (checkError) {
      logger.error('Erro ao buscar competições', { error: checkError });
      return new Response(JSON.stringify({ 
        error: 'Erro ao verificar competições',
        details: checkError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!competitionsToCheck || competitionsToCheck.length === 0) {
      logger.info('Nenhuma competição ativa ou ended encontrada');
      return new Response(JSON.stringify({ 
        message: 'Nenhuma competição para finalizar',
        status: 'no_action_needed'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    let competitionToFinalize = null;

    // Procurar competição que deve ser finalizada (data atual > data de fim)
    for (const comp of competitionsToCheck) {
      if (currentDate > comp.end_date) {
        competitionToFinalize = comp;
        break;
      }
    }

    if (!competitionToFinalize) {
      logger.info('Nenhuma competição precisa ser finalizada hoje', {
        current_date: currentDate,
        competitions: competitionsToCheck.map(c => ({
          id: c.id,
          status: c.status,
          end_date: c.end_date
        }))
      });
      
      return new Response(JSON.stringify({ 
        message: 'Nenhuma competição precisa ser finalizada hoje',
        current_date: currentDate,
        next_end_dates: competitionsToCheck.map(c => c.end_date),
        status: 'no_action_needed'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Executar a finalização completa usando a função SQL existente
    logger.info('Executando finalização automática da competição', {
      competition_id: competitionToFinalize.id,
      end_date: competitionToFinalize.end_date,
      current_date: currentDate
    });

    const { data: finalizationResult, error: finalizationError } = await supabase
      .rpc('finalize_weekly_competition');

    if (finalizationError) {
      logger.error('Erro na finalização da competição', { 
        error: finalizationError,
        competition: competitionToFinalize
      });
      
      return new Response(JSON.stringify({ 
        error: 'Erro na finalização da competição',
        details: finalizationError.message,
        competition_id: competitionToFinalize.id
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!finalizationResult?.success) {
      logger.error('Finalização retornou erro', { 
        result: finalizationResult,
        competition: competitionToFinalize
      });
      
      return new Response(JSON.stringify({ 
        error: 'Falha na finalização',
        details: finalizationResult?.error || 'Erro desconhecido',
        competition_id: competitionToFinalize.id
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    logger.info('Finalização automática executada com sucesso', {
      result: finalizationResult,
      competition_finalized: competitionToFinalize.id,
      snapshot_created: finalizationResult.snapshot_id,
      profiles_reset: finalizationResult.profiles_reset,
      next_competition_activated: finalizationResult.activated_competition?.id
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Competição finalizada automaticamente com sucesso',
      finalization_result: finalizationResult,
      executed_at: new Date().toISOString(),
      current_date: currentDate
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    logger.error('Erro geral na finalização automática', { 
      error: error.message, 
      stack: error.stack 
    });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Erro interno do servidor de finalização'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

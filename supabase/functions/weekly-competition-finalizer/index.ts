
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

    // Verificar se existe competição completed que precisa ser finalizada (snapshot)
    const { data: competitionsToCheck, error: checkError } = await supabase
      .from('weekly_config')
      .select('*')
      .in('status', ['active', 'completed'])
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
      logger.info('Nenhuma competição ativa ou completed encontrada');
      return new Response(JSON.stringify({ 
        message: 'Nenhuma competição para finalizar',
        status: 'no_action_needed'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Primeiro, executar atualização de status para marcar competições expiradas como 'completed'
    logger.info('Executando atualização de status de competições semanais');
    
    const { data: statusUpdateResult, error: statusUpdateError } = await supabase
      .rpc('update_weekly_competitions_status');

    if (statusUpdateError) {
      logger.error('Erro na atualização de status', { error: statusUpdateError });
    } else {
      logger.info('Atualização de status executada', { result: statusUpdateResult });
    }

    // Agora procurar competições 'completed' que precisam de snapshot
    const { data: completedCompetitions, error: completedError } = await supabase
      .from('weekly_config')
      .select('*')
      .eq('status', 'completed')
      .order('completed_at', { ascending: true });

    if (completedError) {
      logger.error('Erro ao buscar competições completed', { error: completedError });
      return new Response(JSON.stringify({ 
        error: 'Erro ao buscar competições finalizadas',
        details: completedError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!completedCompetitions || completedCompetitions.length === 0) {
      logger.info('Nenhuma competição completed precisa de snapshot');
      return new Response(JSON.stringify({ 
        message: 'Nenhuma competição completed precisa de finalização',
        status: 'no_action_needed'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verificar se alguma das competições completed ainda não tem snapshot
    let competitionToFinalize = null;
    
    for (const comp of completedCompetitions) {
      // Verificar se já existe snapshot
      const { data: existingSnapshot } = await supabase
        .from('weekly_competitions_snapshot')
        .select('id')
        .eq('competition_id', comp.id)
        .single();
      
      if (!existingSnapshot) {
        competitionToFinalize = comp;
        logger.info('Encontrada competição completed sem snapshot', {
          competition_id: comp.id,
          end_date: comp.end_date
        });
        break;
      }
    }

    if (!competitionToFinalize) {
      logger.info('Todas as competições completed já possuem snapshot');
      return new Response(JSON.stringify({ 
        message: 'Todas as competições completed já foram finalizadas',
        status: 'no_action_needed'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Executar a finalização completa usando a função SQL existente
    logger.info('Executando finalização automática da competição', {
      competition_id: competitionToFinalize.id,
      end_date: competitionToFinalize.end_date
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
      executed_at: new Date().toISOString()
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


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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
  const requestBody = await req.json().catch(() => ({}));
  const isScheduledExecution = requestBody.scheduled_execution === true;

  try {
    logger.info('🚀 Iniciando verificação de finalização automática de competições', {
      scheduled: isScheduledExecution,
      timestamp: new Date().toISOString()
    });

    // PASSO 1: Verificar status das competições
    const { data: statusCheck, error: statusError } = await supabase
      .rpc('check_weekly_competitions_status');

    if (statusError) {
      logger.error('Erro ao verificar status das competições', { error: statusError });
      return new Response(JSON.stringify({ 
        error: 'Erro ao verificar status das competições',
        details: statusError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    logger.info('Status das competições verificado', { statusCheck });

    // PASSO 2: Buscar competições que precisam ser finalizadas
    const { data: competitionsToFinalize, error: searchError } = await supabase
      .from('weekly_config')
      .select('*')
      .eq('status', 'ended') // Apenas competições marcadas como 'ended'
      .order('end_date', { ascending: true });

    if (searchError) {
      logger.error('Erro ao buscar competições para finalizar', { error: searchError });
      return new Response(JSON.stringify({ 
        error: 'Erro ao buscar competições',
        details: searchError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!competitionsToFinalize || competitionsToFinalize.length === 0) {
      logger.info('✅ Nenhuma competição precisa ser finalizada no momento');
      return new Response(JSON.stringify({ 
        message: 'Nenhuma competição precisa ser finalizada',
        status: 'no_action_needed',
        checked_competitions: statusCheck?.competitions_needing_finalization || 0,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // PASSO 3: Finalizar cada competição encontrada
    const finalizationResults = [];
    
    for (const competition of competitionsToFinalize) {
      logger.info('🏁 Iniciando finalização da competição', {
        competition_id: competition.id,
        title: competition.title || 'Sem título',
        end_date: competition.end_date,
        days_overdue: Math.floor((new Date().getTime() - new Date(competition.end_date).getTime()) / (1000 * 60 * 60 * 24))
      });

      try {
        // Log da tentativa de finalização
        await supabase.rpc('log_weekly_finalization_attempt', {
          competition_id: competition.id,
          success: false, // Será atualizado depois
          execution_details: {
            competition_title: competition.title,
            end_date: competition.end_date,
            execution_type: 'automatic',
            trigger_source: 'cron_job'
          }
        });

        // Executar finalização usando a função SQL existente
        const { data: finalizationResult, error: finalizationError } = await supabase
          .rpc('finalize_weekly_competition');

        if (finalizationError) {
          logger.error('❌ Erro na finalização da competição', { 
            competition_id: competition.id,
            error: finalizationError
          });

          // Log do erro
          await supabase.rpc('log_weekly_finalization_attempt', {
            competition_id: competition.id,
            success: false,
            error_message: finalizationError.message,
            execution_details: {
              error_code: finalizationError.code,
              error_hint: finalizationError.hint
            }
          });

          finalizationResults.push({
            competition_id: competition.id,
            success: false,
            error: finalizationError.message
          });
          continue;
        }

        if (!finalizationResult?.success) {
          logger.error('❌ Finalização retornou erro', { 
            competition_id: competition.id,
            result: finalizationResult
          });

          finalizationResults.push({
            competition_id: competition.id,
            success: false,
            error: finalizationResult?.error || 'Erro desconhecido na finalização'
          });
          continue;
        }

        // Log de sucesso
        await supabase.rpc('log_weekly_finalization_attempt', {
          competition_id: competition.id,
          success: true,
          execution_details: {
            snapshot_id: finalizationResult.snapshot_id,
            profiles_reset: finalizationResult.profiles_reset,
            next_competition_id: finalizationResult.activated_competition?.id,
            finalized_at: new Date().toISOString()
          }
        });

        logger.info('✅ Competição finalizada com sucesso', {
          competition_id: competition.id,
          snapshot_created: finalizationResult.snapshot_id,
          profiles_reset: finalizationResult.profiles_reset,
          next_competition_activated: finalizationResult.activated_competition?.id
        });

        finalizationResults.push({
          competition_id: competition.id,
          success: true,
          result: finalizationResult
        });
      } catch (error: any) {
        logger.error('❌ Erro geral na finalização da competição', { 
          competition_id: competition.id,
          error: error.message
        });

        finalizationResults.push({
          competition_id: competition.id,
          success: false,
          error: error.message
        });
      }
    }

    // PASSO 4: Retornar resultado consolidado
    const successfulFinalizations = finalizationResults.filter(r => r.success);
    const failedFinalizations = finalizationResults.filter(r => !r.success);

    logger.info('🎯 Finalização automática concluída', {
      total_competitions: competitionsToFinalize.length,
      successful: successfulFinalizations.length,
      failed: failedFinalizations.length,
      execution_type: isScheduledExecution ? 'scheduled' : 'manual'
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Verificação de finalização automática concluída',
      summary: {
        competitions_checked: competitionsToFinalize.length,
        successful_finalizations: successfulFinalizations.length,
        failed_finalizations: failedFinalizations.length,
        is_scheduled_execution: isScheduledExecution
      },
      results: finalizationResults,
      executed_at: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    logger.error('❌ Erro geral na finalização automática', { 
      error: error.message, 
      stack: error.stack 
    });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Erro interno do servidor de finalização automática'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});


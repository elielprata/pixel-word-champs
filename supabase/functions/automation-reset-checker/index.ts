
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AutomationConfig {
  enabled: boolean;
  triggerType: 'competition_finalization';
  resetOnCompetitionEnd: boolean;
}

// Sistema de logging estruturado para Edge Function
const createLogger = () => {
  const log = (level: string, message: string, data?: any, category?: string) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      category: category || 'AUTOMATION_RESET',
      data: data || undefined
    };
    console.log(`[${level}] ${category || 'AUTOMATION_RESET'}: ${message}`, data ? JSON.stringify(data) : '');
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
    const requestBody = await req.json().catch(() => ({}));
    const { manual_execution, competition_finalization, competition_id, competition_title } = requestBody;

    logger.info('Processando requisição de automação', { 
      manual_execution, 
      competition_finalization,
      competition_id 
    });

    // Se for execução por finalização de competição
    if (competition_finalization) {
      logger.info('Executando reset por finalização de competição', { competition_title });
      return await executeResetByCompetitionFinalization(supabase, competition_id, competition_title, logger);
    }

    // Se for execução manual
    if (manual_execution) {
      logger.info('Executando reset manual');
      return await executeManualReset(supabase, logger);
    }

    // Verificar se a automação está configurada corretamente
    logger.debug('Verificando configurações de automação');
    return await checkAutomationConfig(supabase, logger);

  } catch (error: any) {
    logger.error('Erro geral na automação', { error: error.message, stack: error.stack });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function executeResetByCompetitionFinalization(supabase: any, competitionId: string, competitionTitle: string, logger: any) {
  const scheduledTime = new Date();
  
  // Registrar log de início
  const { data: logData, error: logError } = await supabase
    .from('automation_logs')
    .insert({
      automation_type: 'score_reset',
      execution_status: 'running',
      scheduled_time: scheduledTime.toISOString(),
      settings_snapshot: {
        triggerType: 'competition_finalization',
        competitionId,
        competitionTitle
      }
    })
    .select()
    .single();

  if (logError) {
    logger.error('Erro ao criar log de execução', { error: logError });
  }

  try {
    // Contar usuários antes do reset
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    logger.info('Resetando pontuações por finalização de competição', { 
      userCount: userCount || 0,
      competitionTitle 
    });

    // Executar reset de pontuações para todos os usuários
    const { error: resetError } = await supabase
      .from('profiles')
      .update({
        total_score: 0,
        games_played: 0
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (resetError) {
      throw new Error(`Erro no reset: ${resetError.message}`);
    }

    // Atualizar log de sucesso
    if (logData) {
      await supabase
        .from('automation_logs')
        .update({
          execution_status: 'completed',
          executed_at: new Date().toISOString(),
          affected_users: userCount || 0
        })
        .eq('id', logData.id);
    }

    // Registrar ação administrativa
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: '00000000-0000-0000-0000-000000000000', // System user
        target_user_id: '00000000-0000-0000-0000-000000000000',
        action_type: 'automated_reset_competition_end',
        details: { 
          affected_users: userCount || 0,
          competition_id: competitionId,
          competition_title: competitionTitle,
          executed_at: new Date().toISOString()
        }
      });

    logger.info('Reset por finalização de competição concluído com sucesso', { 
      affected_users: userCount || 0,
      competition_title: competitionTitle
    });

    return new Response(JSON.stringify({ 
      message: 'Reset por finalização executado com sucesso',
      affected_users: userCount || 0,
      competition_title: competitionTitle
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    logger.error('Erro durante execução por finalização', { error: error.message });

    // Atualizar log de erro
    if (logData) {
      await supabase
        .from('automation_logs')
        .update({
          execution_status: 'failed',
          executed_at: new Date().toISOString(),
          error_message: error.message
        })
        .eq('id', logData.id);
    }

    return new Response(JSON.stringify({ 
      error: error.message,
      context: 'reset_by_competition_finalization'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function executeManualReset(supabase: any, logger: any) {
  const scheduledTime = new Date();
  
  logger.info('Iniciando reset manual');
  
  const { data: logData, error: logError } = await supabase
    .from('automation_logs')
    .insert({
      automation_type: 'score_reset',
      execution_status: 'running',
      scheduled_time: scheduledTime.toISOString(),
      settings_snapshot: { triggerType: 'manual' }
    })
    .select()
    .single();

  if (logError) {
    logger.error('Erro ao criar log de execução manual', { error: logError });
  }

  try {
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    logger.info('Executando reset manual de pontuações', { userCount: userCount || 0 });

    const { error: resetError } = await supabase
      .from('profiles')
      .update({
        total_score: 0,
        games_played: 0
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (resetError) {
      logger.error('Erro no reset manual', { error: resetError });
      throw new Error(`Erro no reset: ${resetError.message}`);
    }

    if (logData) {
      await supabase
        .from('automation_logs')
        .update({
          execution_status: 'completed',
          executed_at: new Date().toISOString(),
          affected_users: userCount || 0
        })
        .eq('id', logData.id);
    }

    logger.info('Reset manual concluído com sucesso', { affected_users: userCount || 0 });

    return new Response(JSON.stringify({ 
      message: 'Reset manual executado com sucesso',
      affected_users: userCount || 0
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    logger.error('Erro durante reset manual', { error: error.message });
    
    if (logData) {
      await supabase
        .from('automation_logs')
        .update({
          execution_status: 'failed',
          executed_at: new Date().toISOString(),
          error_message: error.message
        })
        .eq('id', logData.id);
    }

    return new Response(JSON.stringify({ 
      error: error.message,
      context: 'manual_reset'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function checkAutomationConfig(supabase: any, logger: any) {
  // Buscar configurações de automação
  const { data: settingsData, error: settingsError } = await supabase
    .from('game_settings')
    .select('setting_value')
    .eq('setting_key', 'reset_automation_config')
    .maybeSingle();

  if (settingsError) {
    logger.error('Erro ao buscar configurações de automação', { error: settingsError });
    return new Response(JSON.stringify({ 
      error: 'Erro ao buscar configurações',
      details: settingsError.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (!settingsData?.setting_value) {
    logger.debug('Nenhuma configuração de automação encontrada');
    return new Response(JSON.stringify({ message: 'Nenhuma configuração encontrada' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const config: AutomationConfig = JSON.parse(settingsData.setting_value);
  
  if (!config.enabled) {
    logger.debug('Automação está desabilitada');
    return new Response(JSON.stringify({ message: 'Automação desabilitada' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (config.triggerType === 'competition_finalization') {
    logger.debug('Configurado para reset por finalização de competição');
    return new Response(JSON.stringify({ 
      message: 'Sistema configurado para reset por finalização de competição',
      config: config
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  logger.debug('Configuração de automação encontrada', { config });
  return new Response(JSON.stringify({ 
    message: 'Configuração verificada',
    config: config
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

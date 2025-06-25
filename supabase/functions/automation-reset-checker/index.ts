import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AutomationConfig {
  enabled: boolean;
  triggerType: 'time_based';
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
    const { manual_execution, time_based_check, trigger_type } = requestBody;

    logger.info('Processando requisição de automação', { 
      manual_execution, 
      time_based_check,
      trigger_type 
    });

    // Se for verificação baseada em tempo (cron job diário)
    if (time_based_check) {
      logger.info('Executando verificação baseada em tempo');
      return await executeTimeBasedCheck(supabase, logger);
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

async function executeTimeBasedCheck(supabase: any, logger: any) {
  try {
    logger.info('Verificando se deve executar reset baseado em tempo');

    // Verificar se automação está ativa
    const { data: settingsData, error: settingsError } = await supabase
      .from('game_settings')
      .select('setting_value')
      .eq('setting_key', 'reset_automation_config')
      .maybeSingle();

    if (settingsError) {
      logger.error('Erro ao buscar configurações', { error: settingsError });
      return new Response(JSON.stringify({ 
        error: 'Erro ao buscar configurações',
        details: settingsError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!settingsData?.setting_value) {
      logger.info('Automação não configurada, pulando verificação');
      return new Response(JSON.stringify({ 
        message: 'Automação não configurada' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const config: AutomationConfig = JSON.parse(settingsData.setting_value);
    
    if (!config.enabled) {
      logger.info('Automação desabilitada, pulando verificação');
      return new Response(JSON.stringify({ 
        message: 'Automação desabilitada' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Usar a nova função para verificar se deve resetar
    const { data: resetInfo, error: resetError } = await supabase.rpc('should_reset_weekly_ranking');

    if (resetError) {
      logger.error('Erro ao verificar necessidade de reset', { error: resetError });
      return new Response(JSON.stringify({ 
        error: 'Erro ao verificar reset',
        details: resetError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    logger.info('Informações de reset obtidas', { resetInfo });

    if (!resetInfo.should_reset) {
      logger.info('Reset não necessário no momento', {
        current_date: resetInfo.current_date,
        week_end: resetInfo.week_end,
        next_reset_date: resetInfo.next_reset_date
      });
      
      return new Response(JSON.stringify({ 
        message: 'Reset não necessário',
        info: resetInfo
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Executar o reset
    logger.info('Executando reset automático baseado em tempo', { resetInfo });
    return await executeAutomaticReset(supabase, logger, resetInfo);

  } catch (error: any) {
    logger.error('Erro na verificação baseada em tempo', { error: error.message });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      context: 'time_based_check'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function executeAutomaticReset(supabase: any, logger: any, resetInfo: any) {
  const scheduledTime = new Date();
  
  // Registrar log de início
  const { data: logData, error: logError } = await supabase
    .from('automation_logs')
    .insert({
      automation_type: 'time_based_weekly_reset',
      execution_status: 'running',
      scheduled_time: scheduledTime.toISOString(),
      settings_snapshot: {
        triggerType: 'time_based',
        resetInfo: resetInfo
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

    logger.info('Executando reset automático baseado em tempo', { 
      userCount: userCount || 0,
      resetInfo 
    });

    // Executar reset de pontuações para todos os usuários
    const { error: resetError } = await supabase
      .from('profiles')
      .update({
        total_score: 0,
        games_played: 0,
        best_weekly_position: null
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (resetError) {
      throw new Error(`Erro no reset: ${resetError.message}`);
    }

    // Limpar ranking atual
    const { error: rankingError } = await supabase
      .from('weekly_rankings')
      .delete()
      .eq('week_start', resetInfo.week_start)
      .eq('week_end', resetInfo.week_end);

    if (rankingError) {
      logger.error('Erro ao limpar ranking', { error: rankingError });
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
        action_type: 'automated_time_based_reset',
        details: { 
          affected_users: userCount || 0,
          reset_info: resetInfo,
          executed_at: new Date().toISOString()
        }
      });

    logger.info('Reset automático baseado em tempo concluído com sucesso', { 
      affected_users: userCount || 0,
      reset_info: resetInfo
    });

    return new Response(JSON.stringify({ 
      message: 'Reset automático executado com sucesso',
      affected_users: userCount || 0,
      reset_info: resetInfo
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    logger.error('Erro durante execução automática', { error: error.message });

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
      context: 'automatic_time_based_reset'
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
      automation_type: 'manual_weekly_reset',
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
        games_played: 0,
        best_weekly_position: null
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

  logger.debug('Configuração de automação encontrada', { config });
  return new Response(JSON.stringify({ 
    message: 'Configuração verificada',
    config: config
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

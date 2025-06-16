
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AutomationConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  requiresPassword: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    'https://oqzpkqbmcnpxpegshlcm.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xenBrcWJtY25weHBlZ3NobGNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTE0NjkzNywiZXhwIjoyMDY0NzIyOTM3fQ.DP7vHYKgRAcBHe4Dd_5k2YwCE0IVpZTaclWgFUvmIE8'
  );

  try {
    console.log('🔍 Verificando configurações de automação...');

    // Buscar configurações de automação
    const { data: settingsData, error: settingsError } = await supabase
      .from('game_settings')
      .select('setting_value')
      .eq('setting_key', 'reset_automation_config')
      .maybeSingle();

    if (settingsError) {
      console.error('❌ Erro ao buscar configurações:', settingsError);
      return new Response(JSON.stringify({ error: 'Erro ao buscar configurações' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!settingsData?.setting_value) {
      console.log('ℹ️ Nenhuma configuração de automação encontrada');
      return new Response(JSON.stringify({ message: 'Nenhuma configuração encontrada' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const config: AutomationConfig = JSON.parse(settingsData.setting_value);
    
    if (!config.enabled) {
      console.log('ℹ️ Automação desabilitada');
      return new Response(JSON.stringify({ message: 'Automação desabilitada' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Configuração encontrada:', config);

    // Verificar se deve executar agora
    const shouldExecute = checkIfShouldExecute(config);
    
    if (!shouldExecute) {
      console.log('⏳ Não é hora de executar a automação');
      return new Response(JSON.stringify({ message: 'Não é hora de executar' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🚀 Executando reset automático de pontuações...');

    // Registrar log de início
    const scheduledTime = new Date();
    const { data: logData, error: logError } = await supabase
      .from('automation_logs')
      .insert({
        automation_type: 'score_reset',
        execution_status: 'running',
        scheduled_time: scheduledTime.toISOString(),
        settings_snapshot: config
      })
      .select()
      .single();

    if (logError) {
      console.error('❌ Erro ao criar log:', logError);
    }

    try {
      // Contar usuários antes do reset
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Executar reset de pontuações
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

      // Registrar ação administrativa (assumindo admin system user)
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: '00000000-0000-0000-0000-000000000000', // System user
          target_user_id: '00000000-0000-0000-0000-000000000000',
          action_type: 'automated_reset_all_scores',
          details: { 
            affected_users: userCount || 0,
            automation_config: config,
            executed_at: new Date().toISOString()
          }
        });

      console.log(`✅ Reset automático concluído! ${userCount || 0} usuários afetados`);

      return new Response(JSON.stringify({ 
        message: 'Reset executado com sucesso',
        affected_users: userCount || 0
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error: any) {
      console.error('❌ Erro durante execução:', error);

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

      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error: any) {
    console.error('❌ Erro geral:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function checkIfShouldExecute(config: AutomationConfig): boolean {
  const now = new Date();
  const [targetHours, targetMinutes] = config.time.split(':').map(Number);
  
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  
  // Verificar se é o horário correto (com tolerância de 1 minuto)
  if (currentHours !== targetHours || Math.abs(currentMinutes - targetMinutes) > 1) {
    return false;
  }

  switch (config.frequency) {
    case 'daily':
      return true; // Executa todo dia no horário correto
    
    case 'weekly':
      return now.getDay() === (config.dayOfWeek || 1); // Default: Segunda-feira
    
    case 'monthly':
      return now.getDate() === (config.dayOfMonth || 1); // Default: Dia 1
    
    default:
      return false;
  }
}

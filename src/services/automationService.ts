
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface AutomationConfig {
  enabled: boolean;
  triggerType: 'competition_finalization';
  resetOnCompetitionEnd: boolean;
}

export class AutomationService {
  async loadSettings(): Promise<AutomationConfig | null> {
    try {
      logger.info('Carregando configurações de automação', undefined, 'AUTOMATION_SETTINGS');
      
      const { data, error } = await supabase
        .from('game_settings')
        .select('setting_value')
        .eq('setting_key', 'reset_automation_config')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.setting_value) {
        const config = JSON.parse(data.setting_value);
        // Garantir que está configurado para finalização de competição
        const updatedConfig = {
          enabled: config.enabled || false,
          triggerType: 'competition_finalization' as const,
          resetOnCompetitionEnd: config.resetOnCompetitionEnd || true
        };
        logger.info('Configurações carregadas', { config: updatedConfig }, 'AUTOMATION_SETTINGS');
        return updatedConfig;
      } else {
        logger.info('Nenhuma configuração encontrada, usando padrões', undefined, 'AUTOMATION_SETTINGS');
        return null;
      }
    } catch (error: any) {
      logger.error('Erro ao carregar configurações', { error: error.message }, 'AUTOMATION_SETTINGS');
      throw error;
    }
  }

  async saveSettings(settings: AutomationConfig): Promise<void> {
    try {
      logger.info('Salvando configurações de automação', { settings }, 'AUTOMATION_SETTINGS');

      const { error } = await supabase
        .from('game_settings')
        .upsert({
          setting_key: 'reset_automation_config',
          setting_value: JSON.stringify(settings),
          category: 'automation',
          description: 'Configurações para automação do reset de pontuações por finalização de competição',
          setting_type: 'json'
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;

      logger.info('Configurações salvas com sucesso', undefined, 'AUTOMATION_SETTINGS');
    } catch (error: any) {
      logger.error('Erro ao salvar configurações', { error: error.message }, 'AUTOMATION_SETTINGS');
      throw error;
    }
  }

  async executeManualReset(): Promise<boolean> {
    try {
      logger.info('Executando reset manual via automação', undefined, 'AUTOMATION_SETTINGS');

      // Chamar a Edge Function diretamente
      const { data, error } = await supabase.functions.invoke('automation-reset-checker', {
        body: { 
          manual_execution: true,
          trigger_type: 'manual'
        }
      });

      if (error) throw error;

      logger.info('Reset manual executado com sucesso', { result: data }, 'AUTOMATION_SETTINGS');
      return true;
    } catch (error: any) {
      logger.error('Erro no reset manual', { error: error.message }, 'AUTOMATION_SETTINGS');
      throw error;
    }
  }
}

export const automationService = new AutomationService();

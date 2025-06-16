
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface AutomationConfig {
  enabled: boolean;
  triggerType: 'schedule' | 'competition_finalization';
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
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
        // Garantir compatibilidade com configurações antigas
        const updatedConfig = {
          ...config,
          triggerType: config.triggerType || 'schedule',
          resetOnCompetitionEnd: config.resetOnCompetitionEnd || false
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
          description: 'Configurações para automação do reset de pontuações',
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

  async checkAutomationSchedule(settings: AutomationConfig): Promise<boolean> {
    if (!settings?.enabled) return false;

    try {
      const now = new Date();
      const [hours, minutes] = settings.time.split(':').map(Number);
      
      const shouldExecute = this.checkIfShouldExecute(now, settings, hours, minutes);
      
      if (shouldExecute) {
        logger.info('Automação deve ser executada agora', { settings }, 'AUTOMATION_SETTINGS');
        return true;
      }
      
      return false;
    } catch (error: any) {
      logger.error('Erro ao verificar schedule de automação', { error: error.message }, 'AUTOMATION_SETTINGS');
      return false;
    }
  }

  private checkIfShouldExecute(now: Date, config: AutomationConfig, targetHours: number, targetMinutes: number): boolean {
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    
    if (currentHours !== targetHours || Math.abs(currentMinutes - targetMinutes) > 1) {
      return false;
    }

    switch (config.frequency) {
      case 'daily':
        return true;
      case 'weekly':
        return now.getDay() === (config.dayOfWeek || 1);
      case 'monthly':
        return now.getDate() === (config.dayOfMonth || 1);
      default:
        return false;
    }
  }
}

export const automationService = new AutomationService();


import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface AutomationConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  requiresPassword: boolean;
}

export const useAutomationSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AutomationConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = async () => {
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
        setSettings(config);
        logger.info('Configurações carregadas', { config }, 'AUTOMATION_SETTINGS');
      } else {
        logger.info('Nenhuma configuração encontrada, usando padrões', undefined, 'AUTOMATION_SETTINGS');
      }
    } catch (error: any) {
      logger.error('Erro ao carregar configurações', { error: error.message }, 'AUTOMATION_SETTINGS');
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações de automação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: AutomationConfig) => {
    setIsSaving(true);
    try {
      logger.info('Salvando configurações de automação', { settings: newSettings }, 'AUTOMATION_SETTINGS');

      const { error } = await supabase
        .from('game_settings')
        .upsert({
          setting_key: 'reset_automation_config',
          setting_value: JSON.stringify(newSettings),
          category: 'automation',
          description: 'Configurações para automação do reset de pontuações',
          setting_type: 'json'
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;

      setSettings(newSettings);
      
      toast({
        title: "Sucesso!",
        description: newSettings.enabled 
          ? "Automação ativada com sucesso"
          : "Automação desativada com sucesso",
      });

      logger.info('Configurações salvas com sucesso', undefined, 'AUTOMATION_SETTINGS');
    } catch (error: any) {
      logger.error('Erro ao salvar configurações', { error: error.message }, 'AUTOMATION_SETTINGS');
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const checkAutomationSchedule = async () => {
    if (!settings?.enabled) return false;

    try {
      const now = new Date();
      const [hours, minutes] = settings.time.split(':').map(Number);
      
      // Verificar se é o momento certo para executar
      const shouldExecute = checkIfShouldExecute(now, settings, hours, minutes);
      
      if (shouldExecute) {
        logger.info('Automação deve ser executada agora', { settings }, 'AUTOMATION_SETTINGS');
        return true;
      }
      
      return false;
    } catch (error: any) {
      logger.error('Erro ao verificar schedule de automação', { error: error.message }, 'AUTOMATION_SETTINGS');
      return false;
    }
  };

  const checkIfShouldExecute = (now: Date, config: AutomationConfig, targetHours: number, targetMinutes: number): boolean => {
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
        return now.getDay() === (config.dayOfWeek || 1);
      
      case 'monthly':
        return now.getDate() === (config.dayOfMonth || 1);
      
      default:
        return false;
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    isLoading,
    isSaving,
    saveSettings,
    loadSettings,
    checkAutomationSchedule
  };
};

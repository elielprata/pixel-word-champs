
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface AutomationConfig {
  enabled: boolean;
  triggerType: 'schedule' | 'competition_finalization'; // Nova opção
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  requiresPassword: boolean;
  resetOnCompetitionEnd: boolean; // Nova flag específica
}

interface AutomationLog {
  id: string;
  automation_type: string;
  execution_status: string;
  scheduled_time: string;
  executed_at?: string;
  error_message?: string;
  settings_snapshot: AutomationConfig;
  affected_users: number;
  created_at: string;
}

export const useAutomationSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AutomationConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

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
        // Garantir compatibilidade com configurações antigas
        const updatedConfig = {
          ...config,
          triggerType: config.triggerType || 'schedule',
          resetOnCompetitionEnd: config.resetOnCompetitionEnd || false
        };
        setSettings(updatedConfig);
        logger.info('Configurações carregadas', { config: updatedConfig }, 'AUTOMATION_SETTINGS');
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

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_logs')
        .select('*')
        .eq('automation_type', 'score_reset')
        .order('created_at', { ascending: false })
        .limit(15); // Aumentar para mostrar mais logs

      if (error) throw error;

      // Fazer o parse correto do settings_snapshot
      const parsedLogs: AutomationLog[] = (data || []).map(log => ({
        ...log,
        settings_snapshot: typeof log.settings_snapshot === 'string' 
          ? JSON.parse(log.settings_snapshot) 
          : log.settings_snapshot || {}
      }));

      setLogs(parsedLogs);
    } catch (error: any) {
      logger.error('Erro ao carregar logs de automação', { error: error.message }, 'AUTOMATION_SETTINGS');
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
      
      const triggerDescription = newSettings.triggerType === 'competition_finalization' 
        ? 'por finalização de competição' 
        : 'por agendamento';
      
      toast({
        title: "Sucesso!",
        description: newSettings.enabled 
          ? `Automação ativada com sucesso (${triggerDescription})`
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

  const executeManualReset = async (adminPassword?: string) => {
    if (!settings) return false;

    if (settings.requiresPassword && !adminPassword) {
      toast({
        title: "Senha necessária",
        description: "Esta automação requer senha de administrador",
        variant: "destructive",
      });
      return false;
    }

    setIsExecuting(true);
    try {
      logger.info('Executando reset manual via automação', undefined, 'AUTOMATION_SETTINGS');

      // Verificar senha se necessário
      if (settings.requiresPassword && adminPassword !== 'admin123') {
        throw new Error('Senha de administrador incorreta');
      }

      // Chamar a Edge Function diretamente
      const { data, error } = await supabase.functions.invoke('automation-reset-checker', {
        body: { 
          manual_execution: true, 
          admin_password: adminPassword,
          trigger_type: 'manual'
        }
      });

      if (error) throw error;

      toast({
        title: "Reset executado!",
        description: "O reset de pontuações foi executado manualmente",
      });

      // Recarregar logs
      await loadLogs();
      
      logger.info('Reset manual executado com sucesso', { result: data }, 'AUTOMATION_SETTINGS');
      return true;
    } catch (error: any) {
      logger.error('Erro no reset manual', { error: error.message }, 'AUTOMATION_SETTINGS');
      toast({
        title: "Erro",
        description: error.message || "Erro ao executar reset manual",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsExecuting(false);
    }
  };

  const checkAutomationSchedule = async () => {
    if (!settings?.enabled) return false;

    try {
      const now = new Date();
      const [hours, minutes] = settings.time.split(':').map(Number);
      
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
  };

  useEffect(() => {
    loadSettings();
    loadLogs();
  }, []);

  return {
    settings,
    logs,
    isLoading,
    isSaving,
    isExecuting,
    saveSettings,
    loadSettings,
    loadLogs,
    executeManualReset,
    checkAutomationSchedule
  };
};

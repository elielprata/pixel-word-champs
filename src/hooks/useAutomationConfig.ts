
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { automationService } from '@/services/automationService';

interface AutomationConfig {
  enabled: boolean;
  triggerType: 'schedule' | 'competition_finalization';
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  resetOnCompetitionEnd: boolean;
}

export const useAutomationConfig = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AutomationConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = async () => {
    try {
      const loadedSettings = await automationService.loadSettings();
      setSettings(loadedSettings);
    } catch (error: any) {
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
      await automationService.saveSettings(newSettings);
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
    } catch (error: any) {
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
    if (!settings) return false;
    return await automationService.checkAutomationSchedule(settings);
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

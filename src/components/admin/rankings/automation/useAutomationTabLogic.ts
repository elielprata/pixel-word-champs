
import { useState, useEffect } from 'react';
import { AlertTriangle, Calendar } from 'lucide-react';
import { useAutomationSettings } from '@/hooks/useAutomationSettings';
import { useResetScores } from '@/hooks/useResetScores';
import { useWeeklyConfigSync } from '@/hooks/useWeeklyConfigSync';
import { AutomationConfig } from '../../users/automation/types';
import { getDefaultSettings } from '../../users/automation/utils';

export const useAutomationTabLogic = () => {
  const { logs, isExecuting, executeManualReset, settings: currentSettings, saveSettings } = useAutomationSettings();
  const { resetAllScores, isResettingScores } = useResetScores();
  const { data: syncedConfig, refetch: refetchConfig } = useWeeklyConfigSync();
  
  const [settings, setSettings] = useState<AutomationConfig>(
    currentSettings || getDefaultSettings()
  );
  const [showTestSection, setShowTestSection] = useState(false);
  const [showEmergencyReset, setShowEmergencyReset] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  const handleSave = async () => {
    await saveSettings(settings);
    // Recarregar configuração sincronizada após salvar
    setTimeout(() => {
      refetchConfig();
    }, 1000);
  };

  const handleManualTest = async () => {
    const success = await executeManualReset();
    if (success) {
      setShowTestSection(false);
      // Recarregar configuração após execução manual
      setTimeout(() => {
        refetchConfig();
      }, 1000);
    }
  };

  const handleEmergencyReset = async (password: string) => {
    try {
      await resetAllScores(password);
      setShowEmergencyReset(false);
      // Recarregar configuração após reset de emergência
      setTimeout(() => {
        refetchConfig();
      }, 1000);
    } catch (error) {
      console.error('Erro no reset de emergência:', error);
      throw error;
    }
  };

  // Usar EXCLUSIVAMENTE os dados sincronizados sem transformações adicionais
  const getNextResetInfo = () => {
    if (!syncedConfig) return null;
    
    // Usar os dados EXATOS retornados pela função should_reset_weekly_ranking()
    const resetDate = new Date(syncedConfig.next_reset_date);
    
    if (syncedConfig.should_reset) {
      return {
        message: `Reset deve ser executado AGORA (fim da semana ${syncedConfig.current_week_start} - ${syncedConfig.current_week_end})`,
        color: "text-red-600",
        icon: AlertTriangle
      };
    }
    
    const today = new Date();
    const diffTime = resetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      message: `Próximo reset em ${diffDays} dia(s) - ${resetDate.toLocaleDateString('pt-BR')} às 00:00 (fim da semana ${syncedConfig.current_week_start} - ${syncedConfig.current_week_end})`,
      color: "text-blue-600",
      icon: Calendar
    };
  };

  return {
    // State
    logs,
    settings,
    showTestSection,
    showEmergencyReset,
    resetStatus: syncedConfig,
    
    // Computed
    nextResetInfo: getNextResetInfo(),
    
    // Status flags
    isExecuting,
    isResettingScores,
    
    // Handlers
    setSettings,
    setShowTestSection,
    setShowEmergencyReset,
    handleSave,
    handleManualTest,
    handleEmergencyReset,
    loadResetStatus: refetchConfig
  };
};

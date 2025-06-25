
import { useState, useEffect } from 'react';
import { useAutomationSettings } from '@/hooks/useAutomationSettings';
import { useResetScores } from '@/hooks/useResetScores';
import { AutomationConfig } from '../../users/automation/types';
import { getDefaultSettings } from '../../users/automation/utils';
import { automationService } from '@/services/automationService';
import { formatDateInputToDisplay } from '@/utils/brasiliaTimeUnified';
import { AlertTriangle, Calendar } from 'lucide-react';

export const useAutomationTabLogic = () => {
  const { logs, isExecuting, executeManualReset, settings: currentSettings, saveSettings } = useAutomationSettings();
  const { resetAllScores, isResettingScores } = useResetScores();
  const [settings, setSettings] = useState<AutomationConfig>(
    currentSettings || getDefaultSettings()
  );
  const [showTestSection, setShowTestSection] = useState(false);
  const [showEmergencyReset, setShowEmergencyReset] = useState(false);
  const [resetStatus, setResetStatus] = useState<any>(null);

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  useEffect(() => {
    loadResetStatus();
  }, []);

  const loadResetStatus = async () => {
    try {
      const status = await automationService.checkResetStatus();
      setResetStatus(status);
    } catch (error) {
      console.error('Erro ao carregar status do reset:', error);
    }
  };

  const handleSave = () => {
    saveSettings(settings);
    setTimeout(loadResetStatus, 1000);
  };

  const handleManualTest = async () => {
    const success = await executeManualReset();
    if (success) {
      setShowTestSection(false);
      setTimeout(loadResetStatus, 1000);
    }
  };

  const handleEmergencyReset = async (password: string) => {
    try {
      await resetAllScores(password);
      setShowEmergencyReset(false);
      setTimeout(loadResetStatus, 1000);
    } catch (error) {
      console.error('Erro no reset de emergência:', error);
      throw error;
    }
  };

  const getNextResetInfo = () => {
    if (!resetStatus) return null;
    
    if (resetStatus.should_reset) {
      return {
        message: "Reset deve ser executado agora",
        color: "text-red-600",
        icon: AlertTriangle
      };
    }
    
    const nextResetFormatted = formatDateInputToDisplay(resetStatus.next_reset_date);
    
    const today = new Date().toISOString().split('T')[0];
    const nextResetDate = resetStatus.next_reset_date;
    
    const todayParts = today.split('-').map(Number);
    const nextParts = nextResetDate.split('-').map(Number);
    
    const todayObj = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
    const nextObj = new Date(nextParts[0], nextParts[1] - 1, nextParts[2]);
    
    const diffTime = nextObj.getTime() - todayObj.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      message: `Próximo reset em ${diffDays} dia(s) - ${nextResetFormatted} às 00:00:00`,
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
    resetStatus,
    
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
    loadResetStatus
  };
};

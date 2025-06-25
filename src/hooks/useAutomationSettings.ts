
import { useAutomationConfig } from './useAutomationConfig';
import { useAutomationLogs } from './useAutomationLogs';
import { useAutomationExecution } from './useAutomationExecution';

interface AutomationConfig {
  enabled: boolean;
  triggerType: 'time_based';
  resetOnCompetitionEnd: boolean;
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
  const {
    settings,
    isLoading,
    isSaving,
    saveSettings,
    loadSettings
  } = useAutomationConfig();

  const { logs, loadLogs } = useAutomationLogs();
  const { isExecuting, executeManualReset } = useAutomationExecution();

  return {
    settings,
    logs,
    isLoading,
    isSaving,
    isExecuting,
    saveSettings,
    loadSettings,
    loadLogs,
    executeManualReset
  };
};

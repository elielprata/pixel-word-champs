
import { useState, useEffect } from 'react';
import { automationLogsService } from '@/services/automationLogsService';

interface AutomationLog {
  id: string;
  automation_type: string;
  execution_status: string;
  scheduled_time: string;
  executed_at?: string;
  error_message?: string;
  settings_snapshot: any;
  affected_users: number;
  created_at: string;
}

export const useAutomationLogs = () => {
  const [logs, setLogs] = useState<AutomationLog[]>([]);

  const loadLogs = async () => {
    const loadedLogs = await automationLogsService.loadLogs();
    setLogs(loadedLogs);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return {
    logs,
    loadLogs
  };
};


import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

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

export class AutomationLogsService {
  async loadLogs(): Promise<AutomationLog[]> {
    try {
      const { data, error } = await supabase
        .from('automation_logs')
        .select('*')
        .eq('automation_type', 'score_reset')
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) throw error;

      // Fazer o parse correto do settings_snapshot
      const parsedLogs: AutomationLog[] = (data || []).map(log => ({
        ...log,
        settings_snapshot: typeof log.settings_snapshot === 'string' 
          ? JSON.parse(log.settings_snapshot) 
          : log.settings_snapshot || {}
      }));

      return parsedLogs;
    } catch (error: any) {
      logger.error('Erro ao carregar logs de automação', { error: error.message }, 'AUTOMATION_SETTINGS');
      return [];
    }
  }
}

export const automationLogsService = new AutomationLogsService();


export interface AutomationConfig {
  enabled: boolean;
  triggerType: 'competition_finalization';
  resetOnCompetitionEnd: boolean;
}

export interface AutomationSettingsProps {
  currentSettings: AutomationConfig | null;
  onSaveSettings: (settings: AutomationConfig) => void;
}

export interface AutomationLog {
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

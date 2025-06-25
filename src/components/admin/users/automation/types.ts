
export interface AutomationConfig {
  enabled: boolean;
  triggerType: 'time_based';
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

export interface ResetCheckInfo {
  should_reset: boolean;
  current_date: string;
  week_start: string;
  week_end: string;
  next_reset_date: string;
  is_custom_dates: boolean;
  config: {
    start_day_of_week: number;
    duration_days: number;
    custom_start_date?: string | null;
    custom_end_date?: string | null;
  };
}

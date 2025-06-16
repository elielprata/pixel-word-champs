
export interface AutomationConfig {
  enabled: boolean;
  triggerType: 'schedule' | 'competition_finalization';
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  resetOnCompetitionEnd: boolean;
}

export interface AutomationSettingsProps {
  onSaveSettings: (settings: AutomationConfig) => void;
  currentSettings: AutomationConfig | null;
}

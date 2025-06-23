
import React from 'react';
import { AutomationConfig } from './types';

interface ScheduleConfigurationProps {
  settings: AutomationConfig;
  onSettingsChange: (settings: AutomationConfig) => void;
}

export const ScheduleConfiguration = ({ settings, onSettingsChange }: ScheduleConfigurationProps) => {
  // Não há configurações de agendamento para finalização de competição
  return null;
};


import { AutomationConfig } from './types';

export const getDefaultSettings = (): AutomationConfig => ({
  enabled: false,
  triggerType: 'competition_finalization',
  resetOnCompetitionEnd: true,
});

export const getNextExecution = (settings: AutomationConfig): string | null => {
  if (!settings.enabled) return null;
  
  if (settings.triggerType === 'competition_finalization') {
    return 'Será executado quando uma competição semanal for finalizada';
  }
  
  return null;
};

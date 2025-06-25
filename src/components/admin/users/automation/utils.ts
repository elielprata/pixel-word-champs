
import { AutomationConfig } from './types';

export const getDefaultSettings = (): AutomationConfig => ({
  enabled: false,
  triggerType: 'time_based',
  resetOnCompetitionEnd: true
});

export const getNextExecution = (settings: AutomationConfig, nextResetDate?: string): string => {
  if (!settings.enabled) {
    return 'Automação desabilitada';
  }
  
  if (nextResetDate) {
    const resetDate = new Date(nextResetDate);
    return `Próximo reset: ${resetDate.toLocaleDateString('pt-BR')} às 00:00:00`;
  }
  
  return 'Verificação diária às 00:00:00';
};

export const formatTriggerType = (triggerType: string): string => {
  switch (triggerType) {
    case 'time_based':
      return 'Baseado em Tempo';
    default:
      return triggerType;
  }
};

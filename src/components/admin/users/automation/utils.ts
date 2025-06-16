
import { AutomationConfig } from './types';

export const getNextExecution = (settings: AutomationConfig): Date | null => {
  if (!settings.enabled || settings.triggerType === 'competition_finalization') return null;

  const now = new Date();
  const [hours, minutes] = settings.time.split(':').map(Number);
  
  let nextDate = new Date();
  nextDate.setHours(hours, minutes, 0, 0);

  switch (settings.frequency) {
    case 'daily':
      if (nextDate <= now) {
        nextDate.setDate(nextDate.getDate() + 1);
      }
      break;
    case 'weekly':
      const targetDay = settings.dayOfWeek || 1;
      const currentDay = nextDate.getDay();
      let daysUntilTarget = targetDay - currentDay;
      if (daysUntilTarget <= 0 || (daysUntilTarget === 0 && nextDate <= now)) {
        daysUntilTarget += 7;
      }
      nextDate.setDate(nextDate.getDate() + daysUntilTarget);
      break;
    case 'monthly':
      nextDate.setDate(settings.dayOfMonth || 1);
      if (nextDate <= now) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      break;
  }

  return nextDate;
};

export const getDefaultSettings = (): AutomationConfig => ({
  enabled: false,
  triggerType: 'schedule',
  frequency: 'weekly',
  time: '03:00',
  dayOfWeek: 1,
  dayOfMonth: 1,
  resetOnCompetitionEnd: false
});

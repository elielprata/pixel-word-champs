
import { WeeklyConfig } from '@/types/weeklyConfig';

export const calculateNextDates = (
  scheduledConfigs: WeeklyConfig[],
  activeConfig: WeeklyConfig | null,
  lastCompletedConfig: WeeklyConfig | null
) => {
  let referenceEndDate: Date;
  
  if (scheduledConfigs.length > 0) {
    // Se há competições agendadas, usar a última como referência
    const lastScheduled = scheduledConfigs[scheduledConfigs.length - 1];
    referenceEndDate = new Date(lastScheduled.end_date);
  } else if (activeConfig) {
    // Se há competição ativa, usar ela como referência
    referenceEndDate = new Date(activeConfig.end_date);
  } else if (lastCompletedConfig) {
    // Se há apenas competições finalizadas, usar a última como referência
    referenceEndDate = new Date(lastCompletedConfig.end_date);
  } else {
    // Fallback: usar data atual
    referenceEndDate = new Date();
  }
  
  // Calcular próxima data de início (dia seguinte à última data de fim)
  const nextStart = new Date(referenceEndDate);
  nextStart.setDate(nextStart.getDate() + 1);
  
  // Calcular data de fim (7 dias depois do início)
  const nextEnd = new Date(nextStart);
  nextEnd.setDate(nextEnd.getDate() + 6);
  
  return {
    startDate: nextStart.toISOString().split('T')[0],
    endDate: nextEnd.toISOString().split('T')[0]
  };
};

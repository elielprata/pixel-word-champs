
import { getBrasiliaTime } from './brasiliaTime';

/**
 * Utilitários para verificação de tempo das competições
 */
export const adjustCompetitionEndTime = (startDate: Date): Date => {
  const correctedEndDate = new Date(startDate);
  // Estender o tempo de fim para o próximo dia às 02:00 (horário de Brasília)
  // Isso permite que competições do dia anterior ainda sejam visíveis
  correctedEndDate.setDate(correctedEndDate.getDate() + 1);
  correctedEndDate.setUTCHours(5, 0, 0, 0); // 02:00 Brasília = 05:00 UTC
  return correctedEndDate;
};

export const isCompetitionActive = (startDate: Date, endDate: Date): boolean => {
  const now = new Date();
  const adjustedEndDate = adjustCompetitionEndTime(startDate);
  return now >= startDate && now <= adjustedEndDate;
};

export const logCompetitionVerification = (comp: any, isActive: boolean, now: Date) => {
  console.log(`🔍 Verificando competição "${comp.title}":`, {
    id: comp.id,
    start: new Date(comp.start_date).toISOString(),
    end: new Date(comp.end_date).toISOString(),
    adjustedEnd: adjustCompetitionEndTime(new Date(comp.start_date)).toISOString(),
    now: now.toISOString(),
    isActive: isActive,
    startTime: new Date(comp.start_date).getTime(),
    endTime: new Date(comp.end_date).getTime(),
    adjustedEndTime: adjustCompetitionEndTime(new Date(comp.start_date)).getTime(),
    currentTime: now.getTime()
  });
};

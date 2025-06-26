
/**
 * FUNÇÕES ESPECÍFICAS PARA COMPETIÇÕES
 * Lógica de estado e timing para competições
 */

/**
 * Calcula status da competição baseado em UTC
 */
export const calculateCompetitionStatus = (
  startDateUTC: string, 
  endDateUTC: string
): 'scheduled' | 'active' | 'completed' => {
  const now = new Date();
  const start = new Date(startDateUTC);
  const end = new Date(endDateUTC);

  if (now < start) {
    return 'scheduled';
  } else if (now >= start && now <= end) {
    return 'active';
  } else {
    return 'completed';
  }
};

/**
 * Verifica se competição está ativa
 */
export const isCompetitionActive = (start: string, end: string): boolean => {
  return calculateCompetitionStatus(start, end) === 'active';
};

/**
 * Obter tempo restante de competição em segundos
 */
export const getCompetitionTimeRemaining = (endDate: string): number => {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  const remaining = Math.max(0, Math.floor(diff / 1000)); // Retornar em segundos
  return remaining;
};

/**
 * Obter texto do tempo restante de competição
 */
export const getCompetitionTimeRemainingText = (endDate: string): string => {
  const diff = new Date(endDate).getTime() - new Date().getTime();
  
  if (diff <= 0) return 'Finalizado';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
};

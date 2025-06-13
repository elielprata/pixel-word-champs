
import { competitionStatusService } from '@/services/competitionStatusService';

export const isDailyCompetition = (competition: any): boolean => {
  return competition?.competition_type === 'daily' || competition?.theme;
};

export const validateDailyCompetition = (competition: any): boolean => {
  if (!competition) return false;
  
  // Verificar se é uma competição diária válida
  if (!isDailyCompetition(competition)) return false;
  
  // Verificar se o status está correto
  const correctStatus = competitionStatusService.calculateCorrectStatus({
    start_date: competition.start_date,
    end_date: competition.end_date,
    competition_type: 'daily'
  });
  
  return correctStatus === 'active';
};

export const validateDailyCompetitionData = (formData: any) => {
  if (!formData.title) {
    throw new Error('Título é obrigatório');
  }
  
  if (!formData.start_date) {
    throw new Error('Data de início é obrigatória');
  }
  
  return {
    ...formData,
    competition_type: 'daily'
  };
};

export const isDailyCompetitionTimeValid = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Verificar se é o mesmo dia
  const isSameDay = start.toDateString() === end.toDateString();
  
  return isSameDay;
};

export const getDailyCompetitionEndTime = (startDate: string): string => {
  const start = new Date(startDate);
  const endOfDay = new Date(start);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.toISOString();
};

export const formatDailyCompetitionTime = (dateString: string, isEndTime: boolean = false): string => {
  const date = new Date(dateString);
  
  if (isEndTime) {
    // Para horário de fim, mostrar 23:59:59
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59);
    return endDate.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  
  // Para horário de início, mostrar 00:00:00
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0);
  return startDate.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const isDailyCompetitionActive = (competition: any): boolean => {
  if (!isDailyCompetition(competition)) return false;
  
  return competitionStatusService.shouldCompetitionBeActive({
    start_date: competition.start_date,
    end_date: competition.end_date,
    competition_type: 'daily'
  });
};

export const isDailyCompetitionCompleted = (competition: any): boolean => {
  if (!isDailyCompetition(competition)) return false;
  
  return competitionStatusService.shouldCompetitionBeCompleted({
    start_date: competition.start_date,
    end_date: competition.end_date,
    competition_type: 'daily'
  });
};

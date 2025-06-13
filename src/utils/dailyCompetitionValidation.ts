
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

export const getDailyCompetitionEndTime = (startDate: string): string => {
  const start = new Date(startDate);
  const endOfDay = new Date(start);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.toISOString();
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


import { competitionStatusService } from '@/services/competitionStatusService';

export const isWeeklyCompetition = (competition: any): boolean => {
  return competition?.competition_type === 'weekly';
};

export const validateWeeklyCompetition = (competition: any): boolean => {
  if (!competition) return false;
  
  // Verificar se é uma competição semanal válida
  if (!isWeeklyCompetition(competition)) return false;
  
  // Verificar se o status está correto
  const correctStatus = competitionStatusService.calculateCorrectStatus({
    start_date: competition.start_date,
    end_date: competition.end_date,
    competition_type: 'weekly'
  });
  
  return correctStatus === 'active';
};

export const isWeeklyCompetitionActive = (competition: any): boolean => {
  if (!isWeeklyCompetition(competition)) return false;
  
  return competitionStatusService.shouldCompetitionBeActive({
    start_date: competition.start_date,
    end_date: competition.end_date,
    competition_type: 'weekly'
  });
};

export const isWeeklyCompetitionCompleted = (competition: any): boolean => {
  if (!isWeeklyCompetition(competition)) return false;
  
  return competitionStatusService.shouldCompetitionBeCompleted({
    start_date: competition.start_date,
    end_date: competition.end_date,
    competition_type: 'weekly'
  });
};

export const getWeeklyCompetitionDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

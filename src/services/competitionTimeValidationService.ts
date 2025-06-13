
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { isDailyCompetition } from '@/utils/dailyCompetitionValidation';
import { isWeeklyCompetition } from '@/utils/weeklyCompetitionValidation';

class CompetitionTimeValidationService {
  private validateDailyTime(startDate: string, endDate: string): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Para competições diárias, deve ser no mesmo dia
    return start.toDateString() === end.toDateString();
  }

  private validateWeeklyTime(startDate: string, endDate: string): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Para competições semanais, deve ter pelo menos 1 dia de duração
    const diffInDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays >= 1;
  }

  validateTimeFormat(competition: any): { isValid: boolean; error?: string } {
    if (!competition?.start_date || !competition?.end_date) {
      return { isValid: false, error: 'Datas de início e fim são obrigatórias' };
    }

    const isDailyComp = isDailyCompetition(competition);
    const isWeeklyComp = isWeeklyCompetition(competition);

    if (isDailyComp) {
      const isValid = this.validateDailyTime(competition.start_date, competition.end_date);
      return { 
        isValid, 
        error: isValid ? undefined : 'Competições diárias devem começar e terminar no mesmo dia' 
      };
    }

    if (isWeeklyComp) {
      const isValid = this.validateWeeklyTime(competition.start_date, competition.end_date);
      return { 
        isValid, 
        error: isValid ? undefined : 'Competições semanais devem ter pelo menos 1 dia de duração' 
      };
    }

    return { isValid: true };
  }

  async validateCompetitionTimes(competitions: any[]): Promise<void> {
    for (const competition of competitions) {
      const validation = this.validateTimeFormat(competition);
      
      if (!validation.isValid) {
        logger.warn('Competição com horário inválido detectada', {
          competitionId: competition.id,
          error: validation.error
        }, 'COMPETITION_TIME_VALIDATION');
      }
    }
  }
}

export const competitionTimeValidationService = new CompetitionTimeValidationService();

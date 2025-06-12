
import { supabase } from '@/integrations/supabase/client';
import { competitionParticipationService } from './competitionParticipationService';
import { dailyCompetitionFinalizationService } from './dailyCompetition/dailyCompetitionFinalization';
import { weeklyCompetitionFinalizationService } from './weeklyCompetitionFinalizationService';
import { logger } from '@/utils/logger';

class CompetitionFinalizationService {
  async finalizeDailyCompetition(competitionId: string): Promise<void> {
    try {
      logger.debug('Finalizando competição diária', { competitionId });

      await dailyCompetitionFinalizationService.finalizeDailyCompetition(competitionId);
      
      logger.debug('Competição diária finalizada com sucesso', { competitionId });
    } catch (error) {
      logger.error('Erro ao finalizar competição diária', { competitionId, error });
    }
  }

  async finalizeWeeklyCompetition(competitionId: string): Promise<void> {
    try {
      logger.debug('Finalizando competição semanal', { competitionId });

      await weeklyCompetitionFinalizationService.finalizeWeeklyCompetition(competitionId);

      const { data: linkedDailyCompetitions, error: linkedError } = await supabase
        .from('custom_competitions')
        .select('id')
        .eq('weekly_tournament_id', competitionId)
        .eq('status', 'active');

      if (!linkedError && linkedDailyCompetitions) {
        for (const dailyComp of linkedDailyCompetitions) {
          await this.finalizeDailyCompetition(dailyComp.id);
        }
        logger.debug('Competições diárias vinculadas finalizadas', { 
          competitionId, 
          count: linkedDailyCompetitions.length 
        });
      }

      logger.debug('Competição semanal finalizada com sucesso', { competitionId });
    } catch (error) {
      logger.error('Erro ao finalizar competição semanal', { competitionId, error });
    }
  }
}

export const competitionFinalizationService = new CompetitionFinalizationService();

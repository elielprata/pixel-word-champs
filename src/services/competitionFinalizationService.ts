
import { supabase } from '@/integrations/supabase/client';
import { competitionParticipationService } from './competitionParticipationService';
import { dailyCompetitionFinalizationService } from './dailyCompetition/dailyCompetitionFinalization';
import { weeklyCompetitionFinalizationService } from './weeklyCompetitionFinalizationService';
import { logger } from '@/utils/logger';

class CompetitionFinalizationService {
  async finalizeDailyCompetition(competitionId: string): Promise<void> {
    try {
      logger.info('Iniciando finalização de competição diária', { competitionId }, 'COMPETITION_FINALIZATION_SERVICE');

      await dailyCompetitionFinalizationService.finalizeDailyCompetition(competitionId);
      
      logger.info('Competição diária finalizada com sucesso', { competitionId }, 'COMPETITION_FINALIZATION_SERVICE');
    } catch (error) {
      logger.error('Erro ao finalizar competição diária', { competitionId, error }, 'COMPETITION_FINALIZATION_SERVICE');
    }
  }

  async finalizeWeeklyCompetition(competitionId: string): Promise<void> {
    try {
      logger.info('Iniciando finalização de competição semanal', { competitionId }, 'COMPETITION_FINALIZATION_SERVICE');

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
        logger.info('Competições diárias vinculadas finalizadas', { 
          competitionId, 
          count: linkedDailyCompetitions.length 
        }, 'COMPETITION_FINALIZATION_SERVICE');
      }

      logger.info('Competição semanal finalizada com sucesso', { competitionId }, 'COMPETITION_FINALIZATION_SERVICE');
    } catch (error) {
      logger.error('Erro ao finalizar competição semanal', { competitionId, error }, 'COMPETITION_FINALIZATION_SERVICE');
    }
  }
}

export const competitionFinalizationService = new CompetitionFinalizationService();

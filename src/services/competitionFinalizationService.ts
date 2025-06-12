
import { supabase } from '@/integrations/supabase/client';
import { competitionParticipationService } from './competitionParticipationService';
import { dailyCompetitionFinalizationService } from './dailyCompetition/dailyCompetitionFinalization';
import { weeklyCompetitionFinalizationService } from './weeklyCompetitionFinalizationService';
import { logger } from '@/utils/logger';

class CompetitionFinalizationService {
  async finalizeDailyCompetition(competitionId: string): Promise<void> {
    try {
      logger.debug('Finalizing daily competition');

      await dailyCompetitionFinalizationService.finalizeDailyCompetition(competitionId);
      
      logger.debug('Daily competition finalized successfully');
    } catch (error) {
      logger.error('Error finalizing daily competition', { error });
    }
  }

  async finalizeWeeklyCompetition(competitionId: string): Promise<void> {
    try {
      logger.debug('Finalizing weekly competition');

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
        logger.debug('Linked daily competitions finalized', { 
          count: linkedDailyCompetitions.length 
        });
      }

      logger.debug('Weekly competition finalized successfully');
    } catch (error) {
      logger.error('Error finalizing weekly competition', { error });
    }
  }
}

export const competitionFinalizationService = new CompetitionFinalizationService();

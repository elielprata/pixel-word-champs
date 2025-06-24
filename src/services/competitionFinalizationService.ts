
import { supabase } from '@/integrations/supabase/client';
import { dailyCompetitionFinalizationService } from './dailyCompetition/dailyCompetitionFinalization';
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
}

export const competitionFinalizationService = new CompetitionFinalizationService();


import { rankingUpdateService } from './rankingUpdateService';
import { logger } from '@/utils/logger';

export const rankingService = {
  async updateWeeklyRanking(): Promise<void> {
    logger.debug('Chamada para updateWeeklyRanking', undefined, 'RANKING_SERVICE');
    return rankingUpdateService.updateWeeklyRanking();
  },

  async getTotalParticipants(type: 'weekly'): Promise<number> {
    logger.debug('Buscando total de participantes', { type }, 'RANKING_SERVICE');
    return rankingUpdateService.getTotalParticipants(type);
  }
};

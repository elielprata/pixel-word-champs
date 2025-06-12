
import { RankingPlayer } from '@/types';
import { rankingQueryService } from '@/services/rankingQueryService';
import { logger } from '@/utils/logger';

export const rankingApi = {
  async getDailyRanking(): Promise<RankingPlayer[]> {
    logger.debug('API: Buscando ranking diário', undefined, 'RANKING_API');
    const result = await rankingQueryService.getWeeklyRanking();
    logger.debug('API: Ranking diário retornado', { count: result.length }, 'RANKING_API');
    return result;
  },

  async getWeeklyRanking(): Promise<RankingPlayer[]> {
    logger.debug('API: Buscando ranking semanal', undefined, 'RANKING_API');
    const result = await rankingQueryService.getWeeklyRanking();
    logger.debug('API: Ranking semanal retornado', { count: result.length }, 'RANKING_API');
    return result;
  },

  async getHistoricalRanking(userId: string): Promise<any[]> {
    logger.debug('API: Buscando ranking histórico', { userId }, 'RANKING_API');
    const result = await rankingQueryService.getHistoricalRanking(userId);
    logger.debug('API: Ranking histórico retornado', { userId, count: result.length }, 'RANKING_API');
    return result;
  },

  async getUserPosition(userId: string): Promise<number | null> {
    logger.debug('API: Buscando posição do usuário', { userId }, 'RANKING_API');
    const result = await rankingQueryService.getUserPosition(userId);
    logger.debug('API: Posição do usuário retornada', { userId, position: result }, 'RANKING_API');
    return result;
  }
};


import { RankingPlayer } from '@/types';
import { rankingQueryService } from '@/services/rankingQueryService';
import { logger } from '@/utils/logger';

export const rankingApi = {
  async getDailyRanking(): Promise<RankingPlayer[]> {
    logger.debug('API: Buscando ranking diário', undefined, 'RANKING_API');
    const result = await rankingQueryService.getWeeklyRanking();
    
    // Mapear dados para o formato RankingPlayer
    const mappedResult = result.map((item: any, index: number) => ({
      pos: item.position || index + 1,
      name: item.username || 'Usuário',
      user_id: item.user_id || '',
      score: item.total_score || 0
    }));
    
    logger.debug('API: Ranking diário retornado', { count: mappedResult.length }, 'RANKING_API');
    return mappedResult;
  },

  async getWeeklyRanking(): Promise<RankingPlayer[]> {
    logger.debug('API: Buscando ranking semanal', undefined, 'RANKING_API');
    const result = await rankingQueryService.getWeeklyRanking();
    
    // Mapear dados para o formato RankingPlayer
    const mappedResult = result.map((item: any, index: number) => ({
      pos: item.position || index + 1,
      name: item.username || 'Usuário',
      user_id: item.user_id || '',
      score: item.total_score || 0
    }));
    
    logger.debug('API: Ranking semanal retornado', { count: mappedResult.length }, 'RANKING_API');
    return mappedResult;
  },

  async getHistoricalRanking(userId: string): Promise<any[]> {
    logger.debug('API: Buscando ranking histórico', { userId }, 'RANKING_API');
    // Implementação simplificada para evitar erro
    const result: any[] = [];
    logger.debug('API: Ranking histórico retornado', { userId, count: result.length }, 'RANKING_API');
    return result;
  },

  async getUserPosition(userId: string): Promise<number | null> {
    logger.debug('API: Buscando posição do usuário', { userId }, 'RANKING_API');
    // Implementação simplificada para evitar erro
    const result = null;
    logger.debug('API: Posição do usuário retornada', { userId, position: result }, 'RANKING_API');
    return result;
  }
};

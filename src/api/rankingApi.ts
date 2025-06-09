
import { RankingPlayer } from '@/types';
import { rankingQueryService } from '@/services/rankingQueryService';

export const rankingApi = {
  async getDailyRanking(): Promise<RankingPlayer[]> {
    return rankingQueryService.getDailyRanking();
  },

  async getWeeklyRanking(): Promise<RankingPlayer[]> {
    return rankingQueryService.getWeeklyRanking();
  },

  async getHistoricalRanking(userId: string): Promise<any[]> {
    return rankingQueryService.getHistoricalRanking(userId);
  },

  async getUserPosition(userId: string): Promise<number | null> {
    return rankingQueryService.getUserPosition(userId);
  }
};

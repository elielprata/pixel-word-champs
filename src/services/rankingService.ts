
import { rankingUpdateService } from './rankingUpdateService';

export const rankingService = {
  async updateDailyRanking(): Promise<void> {
    return rankingUpdateService.updateDailyRanking();
  },

  async updateWeeklyRanking(): Promise<void> {
    return rankingUpdateService.updateWeeklyRanking();
  },

  async getTotalParticipants(type: 'daily' | 'weekly'): Promise<number> {
    return rankingUpdateService.getTotalParticipants(type);
  }
};

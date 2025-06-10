
import { rankingUpdateService } from './rankingUpdateService';

export const rankingService = {
  async updateWeeklyRanking(): Promise<void> {
    return rankingUpdateService.updateWeeklyRanking();
  },

  async getTotalParticipants(type: 'weekly'): Promise<number> {
    return rankingUpdateService.getTotalParticipants(type);
  }
};

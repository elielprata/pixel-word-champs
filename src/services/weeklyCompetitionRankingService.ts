
import { weeklyRankingService } from './weeklyRankingService';
import { weeklyStatsService } from './weeklyStatsService';

class WeeklyCompetitionRankingService {
  async getCompetitionRanking(competitionId: string) {
    return weeklyRankingService.getCompetitionRanking(competitionId);
  }

  async getCompetitionStats(competitionId: string) {
    return weeklyStatsService.getCompetitionStats(competitionId);
  }

  async updateParticipantPosition(competitionId: string) {
    return weeklyStatsService.updateParticipantPosition(competitionId);
  }

  async getTopParticipants(competitionId: string, limit: number = 10) {
    return weeklyRankingService.getTopParticipants(competitionId, limit);
  }
}

export const weeklyCompetitionRankingService = new WeeklyCompetitionRankingService();

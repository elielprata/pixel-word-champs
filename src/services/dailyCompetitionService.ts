
import { ApiResponse } from '@/types';
import { dailyCompetitionCoreService } from './dailyCompetition/dailyCompetitionCore';
import { dailyCompetitionParticipationService } from './dailyCompetition/dailyCompetitionParticipation';
import { dailyCompetitionFinalizationService } from './dailyCompetition/dailyCompetitionFinalization';

class DailyCompetitionService {
  async getActiveDailyCompetitions(): Promise<ApiResponse<any[]>> {
    return dailyCompetitionCoreService.getActiveDailyCompetitions();
  }

  async joinCompetitionAutomatically(sessionId: string): Promise<void> {
    const activeCompetitionsResponse = await this.getActiveDailyCompetitions();
    if (!activeCompetitionsResponse.success) {
      console.log('📅 Nenhuma competição diária ativa encontrada');
      return;
    }

    await dailyCompetitionParticipationService.joinCompetitionAutomatically(
      sessionId, 
      activeCompetitionsResponse.data
    );
  }

  async updateParticipationScore(sessionId: string, totalScore: number): Promise<void> {
    return dailyCompetitionParticipationService.updateParticipationScore(sessionId, totalScore);
  }

  async getDailyCompetitionRanking(competitionId: string): Promise<ApiResponse<any[]>> {
    return dailyCompetitionCoreService.getDailyCompetitionRanking(competitionId);
  }

  async finalizeDailyCompetition(competitionId: string): Promise<void> {
    return dailyCompetitionFinalizationService.finalizeDailyCompetition(competitionId);
  }

  async checkUserParticipation(userId: string, competitionId: string): Promise<boolean> {
    return dailyCompetitionParticipationService.checkUserParticipation(userId, competitionId);
  }

  async updateCompetitionRankings(competitionId: string): Promise<void> {
    return dailyCompetitionParticipationService.updateCompetitionRankings(competitionId);
  }
}

export const dailyCompetitionService = new DailyCompetitionService();

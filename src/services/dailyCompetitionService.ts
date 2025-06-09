
import { ApiResponse } from '@/types';
import { createSuccessResponse } from '@/utils/apiHelpers';
import { competitionParticipationService } from './competitionParticipationService';
import { competitionFinalizationService } from './competitionFinalizationService';
import { competitionTimeService } from './competitionTimeService';
import { competitionAutoParticipationService } from './competitionAutoParticipationService';
import { competitionQueryService } from './competitionQueryService';

class DailyCompetitionService {
  async getActiveDailyCompetitions(): Promise<ApiResponse<any[]>> {
    const response = await competitionQueryService.getActiveDailyCompetitions();
    
    if (!response.success || !response.data) {
      return response;
    }

    await competitionTimeService.adjustCompetitionTimes(response.data);
    const activeCompetitions = competitionTimeService.filterActiveCompetitions(response.data);
    
    return createSuccessResponse(activeCompetitions);
  }

  async joinCompetitionAutomatically(sessionId: string): Promise<void> {
    const activeCompetitionsResponse = await this.getActiveDailyCompetitions();
    if (!activeCompetitionsResponse.success) {
      console.log('📅 Nenhuma competição diária ativa encontrada');
      return;
    }

    await competitionAutoParticipationService.joinCompetitionAutomatically(
      sessionId, 
      activeCompetitionsResponse.data
    );
  }

  async updateParticipationScore(sessionId: string, totalScore: number): Promise<void> {
    return competitionAutoParticipationService.updateParticipationScore(sessionId, totalScore);
  }

  async getDailyCompetitionRanking(competitionId: string): Promise<ApiResponse<any[]>> {
    return competitionQueryService.getDailyCompetitionRanking(competitionId);
  }

  // Delegação para o serviço de finalização
  async finalizeDailyCompetition(competitionId: string): Promise<void> {
    return competitionFinalizationService.finalizeDailyCompetition(competitionId);
  }

  // Delegação para o serviço de participação
  async checkUserParticipation(userId: string, competitionId: string): Promise<boolean> {
    return competitionParticipationService.checkUserParticipation(userId, competitionId);
  }

  async updateCompetitionRankings(competitionId: string): Promise<void> {
    return competitionParticipationService.updateCompetitionRankings(competitionId);
  }
}

export const dailyCompetitionService = new DailyCompetitionService();

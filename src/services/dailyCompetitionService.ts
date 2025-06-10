
import { ApiResponse } from '@/types';
import { dailyCompetitionCoreService } from './dailyCompetition/dailyCompetitionCore';
import { dailyCompetitionParticipationService } from './dailyCompetition/dailyCompetitionParticipation';
import { dailyCompetitionFinalizationService } from './dailyCompetition/dailyCompetitionFinalization';

class DailyCompetitionService {
  async getActiveDailyCompetitions(): Promise<ApiResponse<any[]>> {
    console.log('🔍 DailyCompetitionService: Buscando competições ativas...');
    
    const response = await dailyCompetitionCoreService.getActiveDailyCompetitions();
    
    if (response.success) {
      console.log('✅ DailyCompetitionService: Encontradas', response.data.length, 'competições');
      
      // Log detalhado de cada competição
      response.data.forEach((comp, index) => {
        console.log(`📝 Competição ${index + 1}:`, {
          id: comp.id,
          title: comp.title,
          status: comp.status,
          competition_type: comp.competition_type,
          start_date: comp.start_date,
          end_date: comp.end_date
        });
      });
    } else {
      console.error('❌ DailyCompetitionService: Erro ao buscar competições:', response.error);
    }
    
    return response;
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


import { ApiResponse } from '@/types';
import { competitionQueryService } from '../competitionQueryService';

export class DailyCompetitionCoreService {
  async getActiveDailyCompetitions(): Promise<ApiResponse<any[]>> {
    // Retornar diretamente os dados do backend sem processamento adicional
    return competitionQueryService.getActiveDailyCompetitions();
  }

  async getDailyCompetitionRanking(competitionId: string): Promise<ApiResponse<any[]>> {
    return competitionQueryService.getDailyCompetitionRanking(competitionId);
  }
}

export const dailyCompetitionCoreService = new DailyCompetitionCoreService();

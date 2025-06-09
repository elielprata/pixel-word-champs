
import { ApiResponse } from '@/types';
import { createSuccessResponse } from '@/utils/apiHelpers';
import { competitionQueryService } from '../competitionQueryService';
import { competitionTimeService } from '../competitionTimeService';

export class DailyCompetitionCoreService {
  async getActiveDailyCompetitions(): Promise<ApiResponse<any[]>> {
    const response = await competitionQueryService.getActiveDailyCompetitions();
    
    if (!response.success || !response.data) {
      return response;
    }

    await competitionTimeService.adjustCompetitionTimes(response.data);
    const activeCompetitions = competitionTimeService.filterActiveCompetitions(response.data);
    
    return createSuccessResponse(activeCompetitions);
  }

  async getDailyCompetitionRanking(competitionId: string): Promise<ApiResponse<any[]>> {
    return competitionQueryService.getDailyCompetitionRanking(competitionId);
  }
}

export const dailyCompetitionCoreService = new DailyCompetitionCoreService();

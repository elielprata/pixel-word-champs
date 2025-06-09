
import { competitionFinalizationService } from '../competitionFinalizationService';

export class DailyCompetitionFinalizationService {
  async finalizeDailyCompetition(competitionId: string): Promise<void> {
    return competitionFinalizationService.finalizeDailyCompetition(competitionId);
  }
}

export const dailyCompetitionFinalizationService = new DailyCompetitionFinalizationService();

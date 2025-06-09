
import { competitionCoreService } from './competitionCoreService';
import { competitionJoinService } from './competitionJoinService';

class CompetitionService {
  async getActiveCompetitions() {
    return competitionCoreService.getActiveCompetitions();
  }

  async getDailyCompetition() {
    return competitionCoreService.getDailyCompetition();
  }

  async getWeeklyCompetition() {
    return competitionCoreService.getWeeklyCompetition();
  }

  async joinCompetition(competitionId: string) {
    return competitionJoinService.joinCompetition(competitionId);
  }

  async getCompetitionRanking(competitionId: string) {
    return competitionJoinService.getCompetitionRanking(competitionId);
  }
}

export const competitionService = new CompetitionService();

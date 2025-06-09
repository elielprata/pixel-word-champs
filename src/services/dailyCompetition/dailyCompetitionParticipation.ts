
import { competitionAutoParticipationService } from '../competitionAutoParticipationService';
import { competitionParticipationService } from '../competitionParticipationService';

export class DailyCompetitionParticipationService {
  async joinCompetitionAutomatically(sessionId: string, activeCompetitions: any[]): Promise<void> {
    return competitionAutoParticipationService.joinCompetitionAutomatically(
      sessionId, 
      activeCompetitions
    );
  }

  async updateParticipationScore(sessionId: string, totalScore: number): Promise<void> {
    return competitionAutoParticipationService.updateParticipationScore(sessionId, totalScore);
  }

  async checkUserParticipation(userId: string, competitionId: string): Promise<boolean> {
    return competitionParticipationService.checkUserParticipation(userId, competitionId);
  }

  async updateCompetitionRankings(competitionId: string): Promise<void> {
    return competitionParticipationService.updateCompetitionRankings(competitionId);
  }
}

export const dailyCompetitionParticipationService = new DailyCompetitionParticipationService();

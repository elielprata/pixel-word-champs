
import { customCompetitionCoreService } from './customCompetitionCoreService';
import { customCompetitionManagementService } from './customCompetitionManagementService';

export interface CustomCompetitionData {
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  category?: string;
  weeklyTournamentId?: string;
  prizePool: number;
  maxParticipants: number;
  startDate?: string;
  endDate?: string;
}

class CustomCompetitionService {
  async createCompetition(data: any) {
    return customCompetitionCoreService.createCompetition(data);
  }

  async getCustomCompetitions() {
    return customCompetitionCoreService.getCustomCompetitions();
  }

  async getCompetitionById(competitionId: string) {
    return customCompetitionManagementService.getCompetitionById(competitionId);
  }

  async updateCompetition(competitionId: string, data: any) {
    return customCompetitionManagementService.updateCompetition(competitionId, data);
  }

  async deleteCompetition(competitionId: string) {
    return customCompetitionManagementService.deleteCompetition(competitionId);
  }

  async getActiveCompetitions() {
    return customCompetitionCoreService.getActiveCompetitions();
  }
}

export const customCompetitionService = new CustomCompetitionService();

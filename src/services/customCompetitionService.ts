
import { customCompetitionCoreService } from './customCompetitionCoreService';
import { customCompetitionManagementService } from './customCompetitionManagementService';

// Exportar a interface para uso em outros componentes
export interface CustomCompetitionData {
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  category?: string;
  weeklyTournamentId?: string;
  prizePool: number;
  maxParticipants: number;
  startDate?: string; // RADICAL FIX: Mudança para string
  endDate?: string;   // RADICAL FIX: Mudança para string
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

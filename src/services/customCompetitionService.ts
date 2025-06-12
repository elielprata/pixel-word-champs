
import { customCompetitionCoreService } from './customCompetitionCoreService';
import { customCompetitionManagementService } from './customCompetitionManagementService';
import { logger } from '@/utils/logger';

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
    logger.info('Criando competição customizada', { 
      title: data.title, 
      type: data.type 
    }, 'CUSTOM_COMPETITION_SERVICE');
    return customCompetitionCoreService.createCompetition(data);
  }

  async getCustomCompetitions() {
    logger.debug('Buscando competições customizadas', undefined, 'CUSTOM_COMPETITION_SERVICE');
    return customCompetitionCoreService.getCustomCompetitions();
  }

  async getCompetitionById(competitionId: string) {
    logger.debug('Buscando competição por ID', { competitionId }, 'CUSTOM_COMPETITION_SERVICE');
    return customCompetitionManagementService.getCompetitionById(competitionId);
  }

  async updateCompetition(competitionId: string, data: any) {
    logger.info('Atualizando competição', { 
      competitionId, 
      title: data.title 
    }, 'CUSTOM_COMPETITION_SERVICE');
    return customCompetitionManagementService.updateCompetition(competitionId, data);
  }

  async deleteCompetition(competitionId: string) {
    logger.info('Deletando competição', { competitionId }, 'CUSTOM_COMPETITION_SERVICE');
    return customCompetitionManagementService.deleteCompetition(competitionId);
  }

  async getActiveCompetitions() {
    logger.debug('Buscando competições ativas customizadas', undefined, 'CUSTOM_COMPETITION_SERVICE');
    return customCompetitionCoreService.getActiveCompetitions();
  }
}

export const customCompetitionService = new CustomCompetitionService();

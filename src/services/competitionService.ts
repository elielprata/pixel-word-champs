
import { competitionCoreService } from './competitionCoreService';
import { competitionJoinService } from './competitionJoinService';
import { logger } from '@/utils/logger';

class CompetitionService {
  async getActiveCompetitions() {
    logger.debug('Buscando competições ativas', undefined, 'COMPETITION_SERVICE');
    return competitionCoreService.getActiveCompetitions();
  }

  async getDailyCompetition() {
    logger.debug('Buscando competição diária', undefined, 'COMPETITION_SERVICE');
    return competitionCoreService.getCurrentDailyCompetition();
  }

  async getWeeklyCompetition() {
    logger.debug('Buscando competição semanal', undefined, 'COMPETITION_SERVICE');
    return competitionCoreService.getCurrentWeeklyCompetition();
  }

  async joinCompetition(competitionId: string) {
    logger.info('Tentativa de participar em competição', { competitionId }, 'COMPETITION_SERVICE');
    return competitionJoinService.joinCompetition(competitionId);
  }

  async getCompetitionRanking(competitionId: string) {
    logger.debug('Buscando ranking da competição', { competitionId }, 'COMPETITION_SERVICE');
    return competitionJoinService.getCompetitionRanking(competitionId);
  }
}

export const competitionService = new CompetitionService();

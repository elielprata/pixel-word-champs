
import { dailyCompetitionCoreService } from './dailyCompetition/dailyCompetitionCore';
import { competitionJoinService } from './competitionJoinService';
import { logger } from '@/utils/logger';

class CompetitionService {
  async getActiveDailyCompetitions() {
    logger.debug('Buscando competições diárias ativas', undefined, 'COMPETITION_SERVICE');
    return dailyCompetitionCoreService.getActiveDailyCompetitions();
  }

  async getCurrentDailyCompetition() {
    logger.debug('Buscando competição diária atual', undefined, 'COMPETITION_SERVICE');
    return dailyCompetitionCoreService.getActiveDailyCompetitions();
  }

  async getCurrentWeeklyCompetition() {
    logger.debug('Buscando competição semanal atual', undefined, 'COMPETITION_SERVICE');
    // TODO: Implementar lógica específica para competição semanal
    return dailyCompetitionCoreService.getActiveDailyCompetitions();
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

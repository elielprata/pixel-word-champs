
import { ApiResponse } from '@/types';
import { dailyCompetitionCoreService } from './dailyCompetition/dailyCompetitionCore';
import { dailyCompetitionParticipationService } from './dailyCompetition/dailyCompetitionParticipation';
import { dailyCompetitionFinalizationService } from './dailyCompetition/dailyCompetitionFinalization';
import { logger } from '@/utils/logger';

class DailyCompetitionService {
  async getActiveDailyCompetitions(): Promise<ApiResponse<any[]>> {
    logger.debug('Buscando competições diárias ativas', undefined, 'DAILY_COMPETITION_SERVICE');
    return dailyCompetitionCoreService.getActiveDailyCompetitions();
  }

  async joinCompetitionAutomatically(sessionId: string): Promise<void> {
    logger.debug('Tentativa de participação automática', { sessionId }, 'DAILY_COMPETITION_SERVICE');
    const activeCompetitionsResponse = await this.getActiveDailyCompetitions();
    if (!activeCompetitionsResponse.success) {
      logger.info('Nenhuma competição diária ativa encontrada', { sessionId }, 'DAILY_COMPETITION_SERVICE');
      return;
    }

    await dailyCompetitionParticipationService.joinCompetitionAutomatically(
      sessionId, 
      activeCompetitionsResponse.data
    );
  }

  async updateParticipationScore(sessionId: string, totalScore: number): Promise<void> {
    logger.debug('Atualizando pontuação da participação', { sessionId, totalScore }, 'DAILY_COMPETITION_SERVICE');
    return dailyCompetitionParticipationService.updateParticipationScore(sessionId, totalScore);
  }

  async getDailyCompetitionRanking(competitionId: string): Promise<ApiResponse<any[]>> {
    logger.debug('Buscando ranking da competição diária', { competitionId }, 'DAILY_COMPETITION_SERVICE');
    return dailyCompetitionCoreService.getDailyCompetitionRanking(competitionId);
  }

  async finalizeDailyCompetition(competitionId: string): Promise<void> {
    logger.info('Finalizando competição diária', { competitionId }, 'DAILY_COMPETITION_SERVICE');
    return dailyCompetitionFinalizationService.finalizeDailyCompetition(competitionId);
  }

  async checkUserParticipation(userId: string, competitionId: string): Promise<boolean> {
    logger.debug('Verificando participação do usuário', { userId, competitionId }, 'DAILY_COMPETITION_SERVICE');
    return dailyCompetitionParticipationService.checkUserParticipation(userId, competitionId);
  }

  async updateCompetitionRankings(competitionId: string): Promise<void> {
    logger.debug('Atualizando rankings da competição', { competitionId }, 'DAILY_COMPETITION_SERVICE');
    return dailyCompetitionParticipationService.updateCompetitionRankings(competitionId);
  }
}

export const dailyCompetitionService = new DailyCompetitionService();

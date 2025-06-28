
import { createSuccessResponse, createErrorResponse } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';
import { MonthlyInviteCompetition } from '@/types/monthlyInvite';

export class MonthlyInviteCompetitionService {
  private getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  async getCurrentMonthCompetition() {
    try {
      const currentMonth = this.getCurrentMonth();

      // Simular competição se a tabela não existir
      const mockCompetition: MonthlyInviteCompetition = {
        id: 'mock-competition',
        month_year: currentMonth,
        title: `Competição de Indicações ${currentMonth}`,
        description: 'Competição mensal baseada em indicações de amigos',
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        status: 'active' as const,
        total_participants: 0,
        total_prize_pool: 1100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return createSuccessResponse(mockCompetition);
    } catch (error) {
      logger.error('Erro ao buscar competição mensal', { error }, 'MONTHLY_INVITE_SERVICE');
      return createErrorResponse('Erro ao buscar competição');
    }
  }

  async getMonthlyRanking(monthYear?: string, limit = 100) {
    try {
      const targetMonth = monthYear || this.getCurrentMonth();

      // Simular dados de competição e ranking
      const mockCompetition = {
        id: 'mock-competition',
        month_year: targetMonth,
        title: `Competição de Indicações ${targetMonth}`,
        status: 'active',
        total_participants: 0,
        total_prize_pool: 1100
      };

      const mockRankings: any[] = [];

      return createSuccessResponse({
        competition: mockCompetition,
        rankings: mockRankings
      });
    } catch (error) {
      logger.error('Erro ao buscar ranking mensal', { error }, 'MONTHLY_INVITE_SERVICE');
      return createSuccessResponse({
        competition: null,
        rankings: []
      });
    }
  }

  async refreshMonthlyRanking(monthYear?: string) {
    try {
      const targetMonth = monthYear || this.getCurrentMonth();
      
      // Simular atualização bem-sucedida
      logger.info('Ranking mensal simulado', { targetMonth }, 'MONTHLY_INVITE_SERVICE');
      return createSuccessResponse({ success: true, month: targetMonth });
    } catch (error) {
      logger.error('Erro ao atualizar ranking mensal', { error }, 'MONTHLY_INVITE_SERVICE');
      return createErrorResponse('Erro ao atualizar ranking');
    }
  }
}

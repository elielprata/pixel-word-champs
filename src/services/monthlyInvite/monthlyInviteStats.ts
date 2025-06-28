
import { createSuccessResponse } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';
import { MonthlyInviteStats } from '@/types/monthlyInvite';

export class MonthlyInviteStatsService {
  private getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  async getMonthlyStats(monthYear?: string) {
    try {
      const targetMonth = monthYear || this.getCurrentMonth();

      const mockStats: MonthlyInviteStats = {
        competition: {
          id: 'mock-competition',
          month_year: targetMonth,
          title: `Competição de Indicações ${targetMonth}`,
          description: 'Competição mensal baseada em indicações de amigos',
          start_date: new Date().toISOString(),
          end_date: new Date().toISOString(),
          status: 'active' as const,
          total_participants: 0,
          total_prize_pool: 1100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        totalParticipants: 0,
        totalPrizePool: 1100,
        topPerformers: []
      };

      return createSuccessResponse(mockStats);
    } catch (error) {
      logger.error('Erro ao buscar estatísticas mensais', { error }, 'MONTHLY_INVITE_SERVICE');
      return createSuccessResponse({
        competition: null,
        totalParticipants: 0,
        totalPrizePool: 0,
        topPerformers: []
      });
    }
  }
}

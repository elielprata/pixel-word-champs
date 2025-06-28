
import { MonthlyInviteCoreService } from './monthlyInviteCore';
import { MonthlyInviteCompetitionService } from './monthlyInviteCompetition';
import { MonthlyInviteStatsService } from './monthlyInviteStats';
import { MonthlyInvitePrizesService } from './monthlyInvitePrizes';

class MonthlyInviteService {
  private coreService = new MonthlyInviteCoreService();
  private competitionService = new MonthlyInviteCompetitionService();
  private statsService = new MonthlyInviteStatsService();
  private prizesService = new MonthlyInvitePrizesService();

  // Métodos do core service
  getCurrentMonth() {
    return this.coreService.getCurrentMonth();
  }

  async getUserMonthlyPoints(userId?: string, monthYear?: string) {
    return this.coreService.getUserMonthlyPoints(userId, monthYear);
  }

  async getUserMonthlyPosition(userId?: string, monthYear?: string) {
    return this.coreService.getUserMonthlyPosition(userId, monthYear);
  }

  // Métodos do competition service
  async getCurrentMonthCompetition() {
    return this.competitionService.getCurrentMonthCompetition();
  }

  async getMonthlyRanking(monthYear?: string, limit = 100) {
    return this.competitionService.getMonthlyRanking(monthYear, limit);
  }

  async refreshMonthlyRanking(monthYear?: string) {
    return this.competitionService.refreshMonthlyRanking(monthYear);
  }

  // Métodos do stats service
  async getMonthlyStats(monthYear?: string) {
    return this.statsService.getMonthlyStats(monthYear);
  }

  // Métodos do prizes service
  async getMonthlyPrizes(competitionId?: string) {
    return this.prizesService.getMonthlyPrizes(competitionId);
  }

  async updatePrize(prizeId: string, updates: any) {
    return this.prizesService.updatePrize(prizeId, updates);
  }

  async createPrize(competitionId: string, position: number, prizeAmount: number, description?: string) {
    return this.prizesService.createPrize(competitionId, position, prizeAmount, description);
  }

  async deletePrize(prizeId: string) {
    return this.prizesService.deletePrize(prizeId);
  }

  async togglePrizeStatus(prizeId: string, active: boolean) {
    return this.prizesService.togglePrizeStatus(prizeId, active);
  }
}

export const monthlyInviteService = new MonthlyInviteService();

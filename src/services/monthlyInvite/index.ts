
import { MonthlyInviteCoreService } from './monthlyInviteCore';
import { MonthlyInviteCompetitionService } from './monthlyInviteCompetition';
import { MonthlyInviteStatsService } from './monthlyInviteStats';

class MonthlyInviteService {
  private coreService = new MonthlyInviteCoreService();
  private competitionService = new MonthlyInviteCompetitionService();
  private statsService = new MonthlyInviteStatsService();

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
}

export const monthlyInviteService = new MonthlyInviteService();

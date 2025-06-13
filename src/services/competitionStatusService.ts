
interface CompetitionForStatus {
  start_date: string;
  end_date: string;
  competition_type: 'daily' | 'weekly';
}

export const competitionStatusService = {
  calculateCorrectStatus(competition: CompetitionForStatus): string {
    const now = new Date();
    const startDate = new Date(competition.start_date);
    const endDate = new Date(competition.end_date);
    
    console.log('⏰ [CompetitionStatusService] Calculando status:', {
      competition_type: competition.competition_type,
      now: now.toISOString(),
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      isAfterStart: now >= startDate,
      isBeforeEnd: now <= endDate
    });

    if (now < startDate) {
      console.log('📅 Status: scheduled (antes do início)');
      return 'scheduled';
    }
    
    if (now > endDate) {
      console.log('🏁 Status: completed (após o fim)');
      return 'completed';
    }
    
    console.log('🟢 Status: active (durante o período)');
    return 'active';
  },

  shouldCompetitionBeActive(competition: CompetitionForStatus): boolean {
    return this.calculateCorrectStatus(competition) === 'active';
  },

  shouldCompetitionBeCompleted(competition: CompetitionForStatus): boolean {
    return this.calculateCorrectStatus(competition) === 'completed';
  },

  shouldCompetitionBeScheduled(competition: CompetitionForStatus): boolean {
    return this.calculateCorrectStatus(competition) === 'scheduled';
  },

  isStatusMismatch(competition: CompetitionForStatus & { status: string }): boolean {
    const calculatedStatus = this.calculateCorrectStatus(competition);
    const mismatch = competition.status !== calculatedStatus;
    
    if (mismatch) {
      console.log('⚠️ [CompetitionStatusService] Status mismatch detectado:', {
        competition_type: competition.competition_type,
        statusAtual: competition.status,
        statusCalculado: calculatedStatus,
        start_date: competition.start_date,
        end_date: competition.end_date
      });
    }
    
    return mismatch;
  },

  getCompetitionsWithCorrectStatus(competitions: (CompetitionForStatus & { status: string })[]): Array<CompetitionForStatus & { status: string; calculatedStatus: string }> {
    return competitions.map(comp => ({
      ...comp,
      calculatedStatus: this.calculateCorrectStatus(comp)
    }));
  }
};

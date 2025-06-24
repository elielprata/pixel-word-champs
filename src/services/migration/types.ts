
export interface CleanupResult {
  success: boolean;
  itemsRemoved?: number;
  tablesAffected?: string[];
  error?: string;
}

export interface CleanupStatus {
  legacyCompetitions: number;
  orphanedSessions: number;
  unusedWeeklyTournaments: number;
  cleanupSafe: boolean;
  blockers: string[];
}

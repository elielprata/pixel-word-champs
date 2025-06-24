
import { MigrationCleanupOrchestrator } from './migration/migrationCleanupOrchestrator';

// Create a single instance to maintain the existing API
const orchestrator = new MigrationCleanupOrchestrator();

// Export the service with the same interface as before
export const migrationCleanupService = {
  getCleanupStatus: orchestrator.getCleanupStatus,
  cleanOrphanedSessions: orchestrator.cleanOrphanedSessions,
  cleanLegacyCompetitions: orchestrator.cleanLegacyCompetitions,
  cleanUnusedWeeklyTournaments: orchestrator.cleanUnusedWeeklyTournaments,
  performFullCleanup: orchestrator.performFullCleanup.bind(orchestrator)
};

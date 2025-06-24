
import { secureLogger } from '@/utils/secureLogger';
import { CleanupResult } from './types';
import { MigrationStatusAnalyzer } from './migrationStatusAnalyzer';
import { OrphanedSessionsCleanup } from './orphanedSessionsCleanup';
import { LegacyCompetitionsCleanup } from './legacyCompetitionsCleanup';
import { WeeklyTournamentsCleanup } from './weeklyTournamentsCleanup';

export class MigrationCleanupOrchestrator {
  private statusAnalyzer = new MigrationStatusAnalyzer();
  private orphanedSessionsCleanup = new OrphanedSessionsCleanup();
  private legacyCompetitionsCleanup = new LegacyCompetitionsCleanup();
  private weeklyTournamentsCleanup = new WeeklyTournamentsCleanup();

  async performFullCleanup(): Promise<CleanupResult> {
    try {
      secureLogger.info('Iniciando limpeza completa do sistema', undefined, 'MIGRATION_CLEANUP');

      const status = await this.statusAnalyzer.getCleanupStatus();
      
      if (!status.cleanupSafe) {
        throw new Error(`Limpeza bloqueada: ${status.blockers.join(', ')}`);
      }

      let totalRemoved = 0;
      const tablesAffected = new Set<string>();

      // 1. Limpar sessões órfãs
      const orphanedResult = await this.orphanedSessionsCleanup.cleanOrphanedSessions();
      if (orphanedResult.success) {
        totalRemoved += orphanedResult.itemsRemoved || 0;
        orphanedResult.tablesAffected?.forEach(table => tablesAffected.add(table));
      }

      // 2. Limpar competições legadas
      const legacyResult = await this.legacyCompetitionsCleanup.cleanLegacyCompetitions();
      if (legacyResult.success) {
        totalRemoved += legacyResult.itemsRemoved || 0;
        legacyResult.tablesAffected?.forEach(table => tablesAffected.add(table));
      }

      // 3. Limpar torneios não utilizados
      const tournamentsResult = await this.weeklyTournamentsCleanup.cleanUnusedWeeklyTournaments();
      if (tournamentsResult.success) {
        totalRemoved += tournamentsResult.itemsRemoved || 0;
        tournamentsResult.tablesAffected?.forEach(table => tablesAffected.add(table));
      }

      secureLogger.info('Limpeza completa finalizada', { 
        totalRemoved, 
        tablesAffected: Array.from(tablesAffected) 
      }, 'MIGRATION_CLEANUP');

      return {
        success: true,
        itemsRemoved: totalRemoved,
        tablesAffected: Array.from(tablesAffected)
      };

    } catch (error) {
      secureLogger.error('Erro na limpeza completa', { error }, 'MIGRATION_CLEANUP');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Expose individual cleanup methods
  getCleanupStatus = () => this.statusAnalyzer.getCleanupStatus();
  cleanOrphanedSessions = () => this.orphanedSessionsCleanup.cleanOrphanedSessions();
  cleanLegacyCompetitions = () => this.legacyCompetitionsCleanup.cleanLegacyCompetitions();
  cleanUnusedWeeklyTournaments = () => this.weeklyTournamentsCleanup.cleanUnusedWeeklyTournaments();
}

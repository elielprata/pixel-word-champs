
import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/utils/secureLogger';
import { CleanupStatus } from './types';
import { OrphanedSessionsCleanup } from './orphanedSessionsCleanup';
import { LegacyCompetitionsCleanup } from './legacyCompetitionsCleanup';
import { WeeklyTournamentsCleanup } from './weeklyTournamentsCleanup';

export class MigrationStatusAnalyzer {
  private orphanedSessionsCleanup = new OrphanedSessionsCleanup();
  private legacyCompetitionsCleanup = new LegacyCompetitionsCleanup();
  private weeklyTournamentsCleanup = new WeeklyTournamentsCleanup();

  async getCleanupStatus(): Promise<CleanupStatus> {
    try {
      secureLogger.info('Analisando status para limpeza final', undefined, 'MIGRATION_CLEANUP');

      // Contar competições legadas, sessões órfãs e torneios não utilizados
      const [legacyCount, orphanedCount, unusedTournaments] = await Promise.all([
        this.legacyCompetitionsCleanup.getLegacyCompetitionsCount(),
        this.orphanedSessionsCleanup.getOrphanedSessionsCount(),
        this.weeklyTournamentsCleanup.getUnusedTournamentsCount()
      ]);

      const blockers: string[] = [];
      
      // Verificar se ainda há torneios ativos
      const { count: activeTournaments } = await supabase
        .from('custom_competitions')
        .select('*', { count: 'exact', head: true })
        .eq('competition_type', 'tournament')
        .in('status', ['active', 'scheduled']);

      if (activeTournaments && activeTournaments > 0) {
        blockers.push(`${activeTournaments} torneios semanais ainda ativos`);
      }

      const status: CleanupStatus = {
        legacyCompetitions: legacyCount,
        orphanedSessions: orphanedCount,
        unusedWeeklyTournaments: unusedTournaments,
        cleanupSafe: blockers.length === 0,
        blockers
      };

      secureLogger.info('Status de limpeza analisado', { status }, 'MIGRATION_CLEANUP');
      return status;

    } catch (error) {
      secureLogger.error('Erro ao analisar status de limpeza', { error }, 'MIGRATION_CLEANUP');
      throw error;
    }
  }
}

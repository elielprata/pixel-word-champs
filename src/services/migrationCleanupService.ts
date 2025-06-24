
import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/utils/secureLogger';

interface CleanupResult {
  success: boolean;
  itemsRemoved?: number;
  tablesAffected?: string[];
  error?: string;
}

interface CleanupStatus {
  legacyCompetitions: number;
  orphanedSessions: number;
  unusedWeeklyTournaments: number;
  cleanupSafe: boolean;
  blockers: string[];
}

class MigrationCleanupService {
  async getCleanupStatus(): Promise<CleanupStatus> {
    try {
      secureLogger.info('Analisando status para limpeza final', undefined, 'MIGRATION_CLEANUP');

      // Contar competições legadas (vinculadas)
      const { count: legacyCount } = await supabase
        .from('custom_competitions')
        .select('*', { count: 'exact', head: true })
        .eq('competition_type', 'challenge')
        .not('weekly_tournament_id', 'is', null);

      // Contar sessões órfãs
      const { count: orphanedCount } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true)
        .is('competition_id', null);

      // Contar torneios semanais não utilizados
      const { count: unusedTournaments } = await supabase
        .from('custom_competitions')
        .select('*', { count: 'exact', head: true })
        .eq('competition_type', 'tournament')
        .eq('status', 'completed');

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
        legacyCompetitions: legacyCount || 0,
        orphanedSessions: orphanedCount || 0,
        unusedWeeklyTournaments: unusedTournaments || 0,
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

  async cleanOrphanedSessions(): Promise<CleanupResult> {
    try {
      secureLogger.info('Iniciando limpeza de sessões órfãs', undefined, 'MIGRATION_CLEANUP');

      const { count } = await supabase
        .from('game_sessions')
        .delete()
        .eq('is_completed', true)
        .is('competition_id', null);

      secureLogger.info('Sessões órfãs removidas', { count }, 'MIGRATION_CLEANUP');

      return {
        success: true,
        itemsRemoved: count || 0,
        tablesAffected: ['game_sessions']
      };

    } catch (error) {
      secureLogger.error('Erro na limpeza de sessões órfãs', { error }, 'MIGRATION_CLEANUP');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  async cleanLegacyCompetitions(): Promise<CleanupResult> {
    try {
      secureLogger.info('Iniciando limpeza de competições legadas', undefined, 'MIGRATION_CLEANUP');

      // Buscar competições legadas concluídas
      const { data: legacyCompetitions } = await supabase
        .from('custom_competitions')
        .select('id')
        .eq('competition_type', 'challenge')
        .eq('status', 'completed')
        .not('weekly_tournament_id', 'is', null);

      if (!legacyCompetitions || legacyCompetitions.length === 0) {
        return {
          success: true,
          itemsRemoved: 0,
          tablesAffected: []
        };
      }

      const competitionIds = legacyCompetitions.map(c => c.id);

      // Remover competições legadas
      const { count } = await supabase
        .from('custom_competitions')
        .delete()
        .in('id', competitionIds);

      secureLogger.info('Competições legadas removidas', { count }, 'MIGRATION_CLEANUP');

      return {
        success: true,
        itemsRemoved: count || 0,
        tablesAffected: ['custom_competitions']
      };

    } catch (error) {
      secureLogger.error('Erro na limpeza de competições legadas', { error }, 'MIGRATION_CLEANUP');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  async cleanUnusedWeeklyTournaments(): Promise<CleanupResult> {
    try {
      secureLogger.info('Iniciando limpeza de torneios semanais não utilizados', undefined, 'MIGRATION_CLEANUP');

      // Buscar torneios concluídos sem competições diárias vinculadas
      const { data: unusedTournaments } = await supabase
        .from('custom_competitions')
        .select(`
          id,
          title,
          status,
          (
            select count(*) 
            from custom_competitions as daily 
            where daily.weekly_tournament_id = custom_competitions.id
          ) as linked_competitions_count
        `)
        .eq('competition_type', 'tournament')
        .eq('status', 'completed');

      if (!unusedTournaments) {
        return { success: true, itemsRemoved: 0, tablesAffected: [] };
      }

      // Filtrar apenas os que não têm competições vinculadas
      const toDelete = unusedTournaments
        .filter(t => t.linked_competitions_count === 0)
        .map(t => t.id);

      if (toDelete.length === 0) {
        return { success: true, itemsRemoved: 0, tablesAffected: [] };
      }

      const { count } = await supabase
        .from('custom_competitions')
        .delete()
        .in('id', toDelete);

      secureLogger.info('Torneios não utilizados removidos', { count }, 'MIGRATION_CLEANUP');

      return {
        success: true,
        itemsRemoved: count || 0,
        tablesAffected: ['custom_competitions']
      };

    } catch (error) {
      secureLogger.error('Erro na limpeza de torneios', { error }, 'MIGRATION_CLEANUP');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  async performFullCleanup(): Promise<CleanupResult> {
    try {
      secureLogger.info('Iniciando limpeza completa do sistema', undefined, 'MIGRATION_CLEANUP');

      const status = await this.getCleanupStatus();
      
      if (!status.cleanupSafe) {
        throw new Error(`Limpeza bloqueada: ${status.blockers.join(', ')}`);
      }

      let totalRemoved = 0;
      const tablesAffected = new Set<string>();

      // 1. Limpar sessões órfãs
      const orphanedResult = await this.cleanOrphanedSessions();
      if (orphanedResult.success) {
        totalRemoved += orphanedResult.itemsRemoved || 0;
        orphanedResult.tablesAffected?.forEach(table => tablesAffected.add(table));
      }

      // 2. Limpar competições legadas
      const legacyResult = await this.cleanLegacyCompetitions();
      if (legacyResult.success) {
        totalRemoved += legacyResult.itemsRemoved || 0;
        legacyResult.tablesAffected?.forEach(table => tablesAffected.add(table));
      }

      // 3. Limpar torneios não utilizados
      const tournamentsResult = await this.cleanUnusedWeeklyTournaments();
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
}

export const migrationCleanupService = new MigrationCleanupService();

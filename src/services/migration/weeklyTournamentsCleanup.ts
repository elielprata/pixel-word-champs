
import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/utils/secureLogger';
import { CleanupResult } from './types';

export class WeeklyTournamentsCleanup {
  async getUnusedTournamentsCount(): Promise<number> {
    const { count } = await supabase
      .from('custom_competitions')
      .select('*', { count: 'exact', head: true })
      .eq('competition_type', 'tournament')
      .eq('status', 'completed');

    return count || 0;
  }

  async cleanUnusedWeeklyTournaments(): Promise<CleanupResult> {
    try {
      secureLogger.info('Iniciando limpeza de torneios semanais não utilizados', undefined, 'MIGRATION_CLEANUP');

      // Buscar todos os torneios concluídos
      const { data: completedTournaments } = await supabase
        .from('custom_competitions')
        .select('id, title, status')
        .eq('competition_type', 'tournament')
        .eq('status', 'completed');

      if (!completedTournaments || completedTournaments.length === 0) {
        return { success: true, itemsRemoved: 0, tablesAffected: [] };
      }

      const tournamentsToDelete: string[] = [];

      // Para cada torneio, verificar se tem competições vinculadas
      for (const tournament of completedTournaments) {
        const { count: linkedCount } = await supabase
          .from('custom_competitions')
          .select('*', { count: 'exact', head: true })
          .eq('weekly_tournament_id', tournament.id);

        // Se não tem competições vinculadas, pode ser removido
        if (!linkedCount || linkedCount === 0) {
          tournamentsToDelete.push(tournament.id);
        }
      }

      if (tournamentsToDelete.length === 0) {
        return { success: true, itemsRemoved: 0, tablesAffected: [] };
      }

      const { count } = await supabase
        .from('custom_competitions')
        .delete()
        .in('id', tournamentsToDelete);

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
}

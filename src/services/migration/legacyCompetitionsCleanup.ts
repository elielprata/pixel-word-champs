
import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/utils/secureLogger';
import { CleanupResult } from './types';

export class LegacyCompetitionsCleanup {
  async getLegacyCompetitionsCount(): Promise<number> {
    const { count } = await supabase
      .from('custom_competitions')
      .select('*', { count: 'exact', head: true })
      .eq('competition_type', 'challenge')
      .not('weekly_tournament_id', 'is', null);

    return count || 0;
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
}

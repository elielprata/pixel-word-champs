
import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/utils/secureLogger';
import { CleanupResult } from './types';

export class OrphanedSessionsCleanup {
  async getOrphanedSessionsCount(): Promise<number> {
    const { count } = await supabase
      .from('game_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('is_completed', true)
      .is('competition_id', null);

    return count || 0;
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
}

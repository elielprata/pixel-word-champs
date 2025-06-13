
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

class RankingDebugService {
  async debugDailyRanking(competitionId?: string): Promise<{ message: string; debugInfo: any }> {
    try {
      logger.info('Iniciando debug do ranking diário', { competitionId }, 'RANKING_DEBUG_SERVICE');

      const debugInfo: any = {
        timestamp: new Date().toISOString(),
        competitionId,
        participants: []
      };

      // Buscar participações
      let query = supabase
        .from('competition_participations')
        .select(`
          *,
          profiles (
            username,
            total_score
          )
        `);

      if (competitionId) {
        query = query.eq('competition_id', competitionId);
      }

      const { data: participations, error } = await query.order('user_score', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar participações para debug', { error }, 'RANKING_DEBUG_SERVICE');
        throw error;
      }

      debugInfo.participants = participations || [];
      debugInfo.totalParticipants = participations?.length || 0;

      const message = `Debug do ranking concluído. Encontradas ${debugInfo.totalParticipants} participações.`;

      logger.info('Debug do ranking diário concluído', { 
        competitionId, 
        totalParticipants: debugInfo.totalParticipants 
      }, 'RANKING_DEBUG_SERVICE');

      return { message, debugInfo };
    } catch (error) {
      logger.error('Erro crítico no debug do ranking diário', { competitionId, error }, 'RANKING_DEBUG_SERVICE');
      return { 
        message: 'Erro no debug do ranking', 
        debugInfo: { error: error instanceof Error ? error.message : 'Erro desconhecido' } 
      };
    }
  }

  async debugWeeklyRanking(weekStart?: Date): Promise<{ message: string; debugInfo: any }> {
    try {
      logger.info('Iniciando debug do ranking semanal', { weekStart }, 'RANKING_DEBUG_SERVICE');

      const debugInfo: any = {
        timestamp: new Date().toISOString(),
        weekStart,
        rankings: []
      };

      let query = supabase
        .from('weekly_rankings')
        .select('*');

      if (weekStart) {
        query = query.eq('week_start', weekStart.toISOString().split('T')[0]);
      }

      const { data: rankings, error } = await query.order('position', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar rankings para debug', { error }, 'RANKING_DEBUG_SERVICE');
        throw error;
      }

      debugInfo.rankings = rankings || [];
      debugInfo.totalRankings = rankings?.length || 0;

      const message = `Debug do ranking semanal concluído. Encontrados ${debugInfo.totalRankings} registros.`;

      logger.info('Debug do ranking semanal concluído', { 
        weekStart, 
        totalRankings: debugInfo.totalRankings 
      }, 'RANKING_DEBUG_SERVICE');

      return { message, debugInfo };
    } catch (error) {
      logger.error('Erro crítico no debug do ranking semanal', { weekStart, error }, 'RANKING_DEBUG_SERVICE');
      return { 
        message: 'Erro no debug do ranking semanal', 
        debugInfo: { error: error instanceof Error ? error.message : 'Erro desconhecido' } 
      };
    }
  }

  async getSystemStatus(): Promise<{ status: string; details: any }> {
    try {
      logger.debug('Verificando status do sistema de rankings', undefined, 'RANKING_DEBUG_SERVICE');

      const details: any = {
        timestamp: new Date().toISOString(),
        database: 'unknown',
        tables: {}
      };

      // Verificar tabelas principais
      const tables = ['competitions', 'competition_participations', 'weekly_rankings', 'profiles'];
      
      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

          details.tables[table] = {
            status: error ? 'error' : 'ok',
            count: count || 0,
            error: error?.message
          };
        } catch (tableError) {
          details.tables[table] = {
            status: 'error',
            error: tableError instanceof Error ? tableError.message : 'Erro desconhecido'
          };
        }
      }

      const hasErrors = Object.values(details.tables).some((t: any) => t.status === 'error');
      const status = hasErrors ? 'warning' : 'healthy';

      logger.info('Status do sistema verificado', { status, details }, 'RANKING_DEBUG_SERVICE');

      return { status, details };
    } catch (error) {
      logger.error('Erro crítico ao verificar status do sistema', { error }, 'RANKING_DEBUG_SERVICE');
      return { 
        status: 'error', 
        details: { error: error instanceof Error ? error.message : 'Erro desconhecido' } 
      };
    }
  }
}

export const rankingDebugService = new RankingDebugService();

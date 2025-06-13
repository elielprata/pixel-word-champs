
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

class RankingDebugService {
  async checkDataConsistency(): Promise<{ isConsistent: boolean; issues: string[] }> {
    try {
      logger.info('Verificando consistência dos dados de ranking', undefined, 'RANKING_DEBUG_SERVICE');

      const issues: string[] = [];

      // Verificar duplicatas no ranking semanal
      const { data: duplicateRankings, error: duplicateError } = await supabase
        .from('weekly_rankings')
        .select('week_start, user_id, count(*)')
        .group('week_start, user_id')
        .having('count(*) > 1');

      if (duplicateError) {
        logger.error('Erro ao verificar duplicatas no ranking', { error: duplicateError }, 'RANKING_DEBUG_SERVICE');
        issues.push('Erro ao verificar duplicatas no ranking');
      } else if (duplicateRankings && duplicateRankings.length > 0) {
        issues.push(`Encontradas ${duplicateRankings.length} entradas duplicadas no ranking semanal`);
      }

      // Verificar posições inconsistentes
      const { data: rankings, error: rankingsError } = await supabase
        .from('weekly_rankings')
        .select('*')
        .order('week_start', { ascending: false })
        .limit(100);

      if (rankingsError) {
        logger.error('Erro ao verificar posições', { error: rankingsError }, 'RANKING_DEBUG_SERVICE');
        issues.push('Erro ao verificar posições do ranking');
      } else if (rankings) {
        // Agrupar por semana e verificar sequência de posições
        const weekGroups = rankings.reduce((acc, ranking) => {
          const week = ranking.week_start;
          if (!acc[week]) acc[week] = [];
          acc[week].push(ranking);
          return acc;
        }, {} as Record<string, any[]>);

        for (const [week, weekRankings] of Object.entries(weekGroups)) {
          const positions = weekRankings.map(r => r.position).sort((a, b) => a - b);
          for (let i = 0; i < positions.length; i++) {
            if (positions[i] !== i + 1) {
              issues.push(`Posições inconsistentes na semana ${week}: esperado ${i + 1}, encontrado ${positions[i]}`);
              break;
            }
          }
        }
      }

      const isConsistent = issues.length === 0;
      
      logger.info('Verificação de consistência concluída', { 
        isConsistent, 
        issuesCount: issues.length 
      }, 'RANKING_DEBUG_SERVICE');

      return { isConsistent, issues };
    } catch (error) {
      logger.error('Erro crítico ao verificar consistência dos dados', { error }, 'RANKING_DEBUG_SERVICE');
      return { 
        isConsistent: false, 
        issues: ['Erro crítico durante verificação de consistência'] 
      };
    }
  }

  async testFunctionDirectly(functionName: string): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      logger.info('Testando função diretamente', { functionName }, 'RANKING_DEBUG_SERVICE');

      let result;
      let error;

      switch (functionName) {
        case 'update_weekly_ranking':
          const { data, error: rpcError } = await supabase.rpc('update_weekly_ranking');
          result = data;
          error = rpcError;
          break;

        default:
          logger.warn('Função não reconhecida para teste', { functionName }, 'RANKING_DEBUG_SERVICE');
          return { success: false, error: 'Função não reconhecida' };
      }

      if (error) {
        logger.error('Erro ao executar função', { functionName, error }, 'RANKING_DEBUG_SERVICE');
        return { success: false, error: error.message };
      }

      logger.info('Função executada com sucesso', { functionName, result }, 'RANKING_DEBUG_SERVICE');
      return { success: true, result };
    } catch (error) {
      logger.error('Erro crítico ao testar função', { functionName, error }, 'RANKING_DEBUG_SERVICE');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  async getDebugInfo(): Promise<Record<string, any>> {
    try {
      logger.debug('Coletando informações de debug', undefined, 'RANKING_DEBUG_SERVICE');

      const debugInfo: Record<string, any> = {};

      // Informações básicas do ranking
      const { data: totalRankings, error: totalError } = await supabase
        .from('weekly_rankings')
        .select('*', { count: 'exact', head: true });

      if (!totalError) {
        debugInfo.totalRankings = totalRankings;
      }

      // Última atualização
      const { data: lastRanking, error: lastError } = await supabase
        .from('weekly_rankings')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!lastError && lastRanking) {
        debugInfo.lastUpdate = lastRanking.created_at;
      }

      // Verificar se há dados da semana atual
      const startOfWeek = this.getStartOfWeek(new Date());
      const { data: currentWeek, error: currentError } = await supabase
        .from('weekly_rankings')
        .select('*', { count: 'exact', head: true })
        .eq('week_start', startOfWeek.toISOString().split('T')[0]);

      if (!currentError) {
        debugInfo.currentWeekParticipants = currentWeek;
      }

      logger.debug('Informações de debug coletadas', { debugInfo }, 'RANKING_DEBUG_SERVICE');
      return debugInfo;
    } catch (error) {
      logger.error('Erro crítico ao coletar informações de debug', { error }, 'RANKING_DEBUG_SERVICE');
      return { error: 'Erro ao coletar informações de debug' };
    }
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(d.setDate(diff));
  }
}

export const rankingDebugService = new RankingDebugService();

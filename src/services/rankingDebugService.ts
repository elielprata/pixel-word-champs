
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const rankingDebugService = {
  async checkDataConsistency() {
    try {
      logger.info('Verificando consistência entre profiles e weekly_rankings', undefined, 'RANKING_DEBUG_SERVICE');
      
      // Buscar dados da tabela profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, total_score')
        .order('total_score', { ascending: false });

      if (profilesError) {
        logger.error('Erro ao buscar profiles para verificação', { error: profilesError }, 'RANKING_DEBUG_SERVICE');
        return;
      }

      // Buscar dados do ranking semanal atual
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data: weeklyRanking, error: rankingError } = await supabase
        .from('weekly_rankings')
        .select('user_id, total_score, position')
        .eq('week_start', weekStartStr)
        .order('position', { ascending: true });

      if (rankingError) {
        logger.error('Erro ao buscar weekly_rankings para verificação', { error: rankingError }, 'RANKING_DEBUG_SERVICE');
        return;
      }

      logger.debug('Dados da tabela profiles (top 10)', { 
        topProfiles: profiles?.slice(0, 10).map((profile, index) => ({
          position: index + 1,
          username: profile.username,
          score: profile.total_score,
          id: profile.id
        }))
      }, 'RANKING_DEBUG_SERVICE');

      logger.debug('Dados do weekly_rankings', { 
        rankings: weeklyRanking?.map((ranking) => {
          const profile = profiles?.find(p => p.id === ranking.user_id);
          return {
            position: ranking.position,
            scoreInRanking: ranking.total_score,
            realScore: profile?.total_score || 'N/A',
            username: profile?.username || 'N/A'
          };
        })
      }, 'RANKING_DEBUG_SERVICE');

      // Análise de inconsistências
      const inconsistencies = weeklyRanking?.filter(ranking => {
        const profile = profiles?.find(p => p.id === ranking.user_id);
        return profile && ranking.total_score !== profile.total_score;
      }) || [];

      const summary = {
        totalProfiles: profiles?.length || 0,
        totalInRanking: weeklyRanking?.length || 0,
        inconsistenciesFound: inconsistencies.length,
        weekStart: weekStartStr
      };

      logger.info('Resumo da análise de consistência', summary, 'RANKING_DEBUG_SERVICE');

      if (inconsistencies.length > 0) {
        logger.warn('Inconsistências detectadas', { 
          inconsistencies: inconsistencies.map(inc => {
            const profile = profiles?.find(p => p.id === inc.user_id);
            return {
              username: profile?.username,
              rankingScore: inc.total_score,
              realScore: profile?.total_score
            };
          })
        }, 'RANKING_DEBUG_SERVICE');
      }

      return {
        profiles: profiles || [],
        weeklyRanking: weeklyRanking || [],
        weekStart: weekStartStr,
        inconsistencies: inconsistencies.length,
        summary
      };
    } catch (error) {
      logger.error('Erro na verificação de consistência', { error }, 'RANKING_DEBUG_SERVICE');
    }
  },

  async forceRankingUpdate() {
    try {
      logger.info('Forçando atualização do ranking semanal', undefined, 'RANKING_DEBUG_SERVICE');
      
      const { error } = await supabase.rpc('update_weekly_ranking');
      
      if (error) {
        logger.error('Erro ao forçar atualização do ranking', { error }, 'RANKING_DEBUG_SERVICE');
        throw error;
      }
      
      logger.info('Ranking semanal atualizado com sucesso', undefined, 'RANKING_DEBUG_SERVICE');
      
      // Verificar consistência após a atualização
      setTimeout(() => {
        this.checkDataConsistency();
      }, 1000);
      
    } catch (error) {
      logger.error('Erro ao forçar atualização', { error }, 'RANKING_DEBUG_SERVICE');
      throw error;
    }
  },

  async testFunctionDirectly() {
    try {
      logger.debug('Testando função update_weekly_ranking diretamente', undefined, 'RANKING_DEBUG_SERVICE');
      
      const { data, error } = await supabase.rpc('update_weekly_ranking');
      
      if (error) {
        logger.error('Erro no teste da função', { error }, 'RANKING_DEBUG_SERVICE');
        return { success: false, error };
      }
      
      logger.info('Função executada sem erros', { data }, 'RANKING_DEBUG_SERVICE');
      return { success: true, data };
      
    } catch (error) {
      logger.error('Erro no teste da função', { error }, 'RANKING_DEBUG_SERVICE');
      return { success: false, error };
    }
  }
};

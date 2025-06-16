
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export class RankingService {
  async updateWeeklyRanking(): Promise<void> {
    try {
      logger.info('Atualizando ranking semanal global', undefined, 'RANKING_SERVICE');
      
      const { error } = await supabase.rpc('update_weekly_ranking');
      
      if (error) {
        logger.error('Erro ao atualizar ranking semanal', { error: error.message }, 'RANKING_SERVICE');
        throw error;
      }
      
      logger.info('Ranking semanal atualizado com sucesso', undefined, 'RANKING_SERVICE');
    } catch (error: any) {
      logger.error('Erro na atualização do ranking semanal', { error: error.message }, 'RANKING_SERVICE');
      throw error;
    }
  }

  async getTotalWeeklyParticipants(): Promise<number> {
    try {
      // Para ranking semanal global, buscar da semana atual
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];
      
      const { count, error } = await supabase
        .from('weekly_rankings')
        .select('*', { count: 'exact', head: true })
        .eq('week_start', weekStartStr);

      if (error) {
        logger.error('Erro ao contar participantes semanais', { error: error.message }, 'RANKING_SERVICE');
        throw error;
      }
      
      return count || 0;
    } catch (error: any) {
      logger.error('Erro ao obter total de participantes semanais', { error: error.message }, 'RANKING_SERVICE');
      return 0;
    }
  }

  /**
   * Busca ranking semanal baseado no período específico de uma competição
   */
  async getWeeklyRankingForCompetition(startDate: string, endDate: string): Promise<any[]> {
    try {
      logger.info('Buscando ranking semanal para competição específica', { startDate, endDate }, 'RANKING_SERVICE');
      
      // Primeiro, tentar buscar por sobreposição de datas
      let { data: rankingData, error } = await supabase
        .from('weekly_rankings')
        .select('user_id, username, position, total_score, prize_amount, week_start, week_end')
        .gte('week_end', startDate.split('T')[0])
        .lte('week_start', endDate.split('T')[0])
        .order('position', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar ranking por sobreposição', { error: error.message }, 'RANKING_SERVICE');
        throw error;
      }

      // Se não encontrou por sobreposição, buscar por proximidade
      if (!rankingData || rankingData.length === 0) {
        logger.info('Nenhum ranking encontrado por sobreposição, buscando por proximidade', undefined, 'RANKING_SERVICE');
        
        const { data: allRankings, error: allError } = await supabase
          .from('weekly_rankings')
          .select('user_id, username, position, total_score, prize_amount, week_start, week_end')
          .order('week_start', { ascending: false })
          .limit(500);

        if (allError) {
          logger.error('Erro ao buscar todos os rankings', { error: allError.message }, 'RANKING_SERVICE');
          throw allError;
        }

        if (allRankings && allRankings.length > 0) {
          // Encontrar a semana mais próxima
          const competitionStart = new Date(startDate).getTime();
          const competitionEnd = new Date(endDate).getTime();
          
          const rankedByProximity = allRankings
            .map(ranking => {
              const weekStart = new Date(ranking.week_start).getTime();
              const weekEnd = new Date(ranking.week_end).getTime();
              
              const distance = Math.min(
                Math.abs(weekStart - competitionStart),
                Math.abs(weekEnd - competitionEnd),
                Math.abs(weekStart - competitionEnd),
                Math.abs(weekEnd - competitionStart)
              );
              
              return { ...ranking, distance };
            })
            .sort((a, b) => a.distance - b.distance);

          if (rankedByProximity.length > 0) {
            const closestWeekStart = rankedByProximity[0].week_start;
            rankingData = rankedByProximity
              .filter(r => r.week_start === closestWeekStart)
              .sort((a, b) => a.position - b.position);
            
            logger.info('Usando ranking da semana mais próxima', { 
              weekStart: closestWeekStart, 
              count: rankingData.length 
            }, 'RANKING_SERVICE');
          }
        }
      }

      return rankingData || [];
    } catch (error: any) {
      logger.error('Erro ao buscar ranking para competição', { error: error.message }, 'RANKING_SERVICE');
      return [];
    }
  }
}

export const rankingService = new RankingService();

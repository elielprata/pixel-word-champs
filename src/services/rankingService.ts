
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
}

export const rankingService = new RankingService();

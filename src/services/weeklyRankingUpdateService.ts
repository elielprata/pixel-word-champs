
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

class WeeklyRankingUpdateService {
  async updateWeeklyRankingFromParticipations(): Promise<void> {
    try {
      logger.info('Iniciando atualização do ranking semanal a partir das participações', undefined, 'WEEKLY_RANKING_UPDATE');
      
      const { error } = await supabase.rpc('update_weekly_ranking');
      
      if (error) {
        logger.error('Erro ao atualizar ranking semanal', { error: error.message }, 'WEEKLY_RANKING_UPDATE');
        throw error;
      }
      
      logger.info('Ranking semanal atualizado com sucesso', undefined, 'WEEKLY_RANKING_UPDATE');
    } catch (error: any) {
      logger.error('Erro na atualização do ranking semanal', { error: error.message }, 'WEEKLY_RANKING_UPDATE');
      throw error;
    }
  }

  async getCurrentWeekStart(): Promise<string> {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(today.setDate(diff));
    return weekStart.toISOString().split('T')[0];
  }

  async getWeeklyRankingStats() {
    try {
      const { data, error } = await supabase.rpc('get_weekly_ranking_stats');
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      logger.error('Erro ao obter estatísticas do ranking semanal', { error: error.message }, 'WEEKLY_RANKING_UPDATE');
      throw error;
    }
  }
}

export const weeklyRankingUpdateService = new WeeklyRankingUpdateService();

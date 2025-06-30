
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

class WeeklyRankingUpdateService {
  async updateWeeklyRankingFromParticipations(): Promise<void> {
    try {
      logger.info('Iniciando atualização automática do ranking semanal', undefined, 'WEEKLY_RANKING_UPDATE');
      
      const { error } = await supabase.rpc('update_weekly_ranking');
      
      if (error) {
        logger.error('Erro ao atualizar ranking semanal', { error: error.message }, 'WEEKLY_RANKING_UPDATE');
        throw error;
      }
      
      logger.info('Ranking semanal atualizado automaticamente com sucesso', undefined, 'WEEKLY_RANKING_UPDATE');
    } catch (error: any) {
      logger.error('Erro na atualização automática do ranking semanal', { error: error.message }, 'WEEKLY_RANKING_UPDATE');
      throw error;
    }
  }

  async getCurrentWeekStart(): Promise<string> {
    // Usar horário de Brasília para consistência
    const today = new Date();
    const brasiliaTime = new Date(today.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    const dayOfWeek = brasiliaTime.getDay();
    const diff = brasiliaTime.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(brasiliaTime.setDate(diff));
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

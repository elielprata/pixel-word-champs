
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

class WeeklyRankingUpdateService {
  async updateWeeklyRankingFromParticipations(): Promise<void> {
    try {
      logger.info('Iniciando atualização robusta do ranking semanal', undefined, 'WEEKLY_RANKING_UPDATE');
      
      const { error } = await supabase.rpc('update_weekly_ranking');
      
      if (error) {
        logger.error('Erro ao atualizar ranking semanal', { error: error.message }, 'WEEKLY_RANKING_UPDATE');
        throw error;
      }
      
      logger.info('Ranking semanal atualizado com sucesso usando UPSERT robusto', undefined, 'WEEKLY_RANKING_UPDATE');
    } catch (error: any) {
      logger.error('Erro na atualização robusta do ranking semanal', { error: error.message }, 'WEEKLY_RANKING_UPDATE');
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

  async validateRankingIntegrity() {
    try {
      // Buscar todos os registros e detectar duplicatas do lado do cliente
      const { data: allRankings, error } = await supabase
        .from('weekly_rankings')
        .select('user_id, week_start, id, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Detectar duplicatas manualmente
      const seenKeys = new Set<string>();
      const duplicates: any[] = [];
      
      allRankings?.forEach(ranking => {
        const key = `${ranking.user_id}-${ranking.week_start}`;
        if (seenKeys.has(key)) {
          duplicates.push({
            user_id: ranking.user_id,
            week_start: ranking.week_start,
            id: ranking.id
          });
        } else {
          seenKeys.add(key);
        }
      });

      if (duplicates.length > 0) {
        logger.warn('Duplicatas detectadas no ranking semanal', { duplicates }, 'WEEKLY_RANKING_UPDATE');
        return { hasDuplicates: true, duplicates };
      }

      logger.info('Integridade do ranking semanal verificada - sem duplicatas', undefined, 'WEEKLY_RANKING_UPDATE');
      return { hasDuplicates: false, duplicates: [] };
    } catch (error: any) {
      logger.error('Erro ao validar integridade do ranking', { error: error.message }, 'WEEKLY_RANKING_UPDATE');
      throw error;
    }
  }
}

export const weeklyRankingUpdateService = new WeeklyRankingUpdateService();

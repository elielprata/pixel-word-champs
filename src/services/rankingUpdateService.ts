
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

class RankingUpdateService {
  async updateWeeklyRanking(): Promise<void> {
    try {
      logger.info('Iniciando atualização do ranking semanal', undefined, 'RANKING_UPDATE_SERVICE');

      const { error } = await supabase.rpc('update_weekly_ranking');

      if (error) {
        logger.error('Erro ao executar função de atualização do ranking semanal', { error }, 'RANKING_UPDATE_SERVICE');
        throw error;
      }

      logger.info('Ranking semanal atualizado com sucesso', undefined, 'RANKING_UPDATE_SERVICE');
    } catch (error) {
      logger.error('Erro crítico ao atualizar ranking semanal', { error }, 'RANKING_UPDATE_SERVICE');
      throw error;
    }
  }

  async getTotalParticipants(type: 'weekly'): Promise<number> {
    try {
      logger.debug('Buscando total de participantes', { type }, 'RANKING_UPDATE_SERVICE');

      if (type === 'weekly') {
        const startOfWeek = this.getStartOfWeek(new Date());
        const endOfWeek = this.getEndOfWeek(startOfWeek);

        const { count, error } = await supabase
          .from('weekly_rankings')
          .select('*', { count: 'exact', head: true })
          .gte('week_start', startOfWeek.toISOString().split('T')[0])
          .lte('week_end', endOfWeek.toISOString().split('T')[0]);

        if (error) {
          logger.error('Erro ao buscar total de participantes semanais', { error }, 'RANKING_UPDATE_SERVICE');
          throw error;
        }

        const participantsCount = count || 0;
        logger.debug('Total de participantes semanais encontrado', { 
          count: participantsCount 
        }, 'RANKING_UPDATE_SERVICE');

        return participantsCount;
      }

      return 0;
    } catch (error) {
      logger.error('Erro crítico ao buscar total de participantes', { 
        type, 
        error 
      }, 'RANKING_UPDATE_SERVICE');
      return 0;
    }
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(d.setDate(diff));
  }

  private getEndOfWeek(startOfWeek: Date): Date {
    const d = new Date(startOfWeek);
    return new Date(d.setDate(d.getDate() + 6)); // Sunday
  }
}

export const rankingUpdateService = new RankingUpdateService();

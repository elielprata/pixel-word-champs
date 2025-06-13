import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface WeeklyRankingEntry {
  id: string;
  user_id: string;
  score: number;
  position: number;
  week_start: string;
  week_end: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
  prize?: number;
  payment_status?: 'pending' | 'completed' | 'failed';
}

class WeeklyRankingService {
  async getCurrentWeekRanking(): Promise<WeeklyRankingEntry[]> {
    try {
      logger.debug('Buscando ranking da semana atual', undefined, 'WEEKLY_RANKING_SERVICE');

      const startOfWeek = this.getStartOfWeek(new Date());
      const endOfWeek = this.getEndOfWeek(startOfWeek);

      const { data, error } = await supabase
        .from('weekly_rankings')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .gte('week_start', startOfWeek.toISOString().split('T')[0])
        .lte('week_end', endOfWeek.toISOString().split('T')[0])
        .order('position', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar ranking semanal no banco de dados', { error }, 'WEEKLY_RANKING_SERVICE');
        throw error;
      }

      logger.debug('Ranking semanal carregado', { 
        entriesCount: data?.length || 0 
      }, 'WEEKLY_RANKING_SERVICE');

      return data || [];
    } catch (error) {
      logger.error('Erro crítico ao buscar ranking semanal', { error }, 'WEEKLY_RANKING_SERVICE');
      return [];
    }
  }

  async getUserWeeklyPosition(userId: string): Promise<WeeklyRankingEntry | null> {
    try {
      logger.debug('Buscando posição semanal do usuário', { userId }, 'WEEKLY_RANKING_SERVICE');

      const startOfWeek = this.getStartOfWeek(new Date());
      const endOfWeek = this.getEndOfWeek(startOfWeek);

      const { data, error } = await supabase
        .from('weekly_rankings')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .gte('week_start', startOfWeek.toISOString().split('T')[0])
        .lte('week_end', endOfWeek.toISOString().split('T')[0])
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.debug('Usuário não está no ranking semanal', { userId }, 'WEEKLY_RANKING_SERVICE');
          return null;
        }
        logger.error('Erro ao buscar posição semanal do usuário', { 
          userId, 
          error 
        }, 'WEEKLY_RANKING_SERVICE');
        throw error;
      }

      logger.debug('Posição semanal do usuário encontrada', { 
        userId, 
        position: data.position 
      }, 'WEEKLY_RANKING_SERVICE');

      return data;
    } catch (error) {
      logger.error('Erro crítico ao buscar posição semanal do usuário', { 
        userId, 
        error 
      }, 'WEEKLY_RANKING_SERVICE');
      return null;
    }
  }

  async updateWeeklyRanking(): Promise<boolean> {
    try {
      logger.info('Iniciando atualização do ranking semanal', undefined, 'WEEKLY_RANKING_SERVICE');

      const { error } = await supabase.rpc('update_weekly_ranking');

      if (error) {
        logger.error('Erro ao executar atualização do ranking semanal', { error }, 'WEEKLY_RANKING_SERVICE');
        throw error;
      }

      logger.info('Ranking semanal atualizado com sucesso', undefined, 'WEEKLY_RANKING_SERVICE');
      return true;
    } catch (error) {
      logger.error('Erro crítico ao atualizar ranking semanal', { error }, 'WEEKLY_RANKING_SERVICE');
      return false;
    }
  }

  async getHistoricalRanking(weekStart: Date): Promise<WeeklyRankingEntry[]> {
    try {
      logger.debug('Buscando ranking histórico', { weekStart }, 'WEEKLY_RANKING_SERVICE');

      const { data, error } = await supabase
        .from('weekly_rankings')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('week_start', weekStart.toISOString().split('T')[0])
        .order('position', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar ranking histórico no banco de dados', { 
          weekStart, 
          error 
        }, 'WEEKLY_RANKING_SERVICE');
        throw error;
      }

      logger.debug('Ranking histórico carregado', { 
        weekStart, 
        entriesCount: data?.length || 0 
      }, 'WEEKLY_RANKING_SERVICE');

      return data || [];
    } catch (error) {
      logger.error('Erro crítico ao buscar ranking histórico', { 
        weekStart, 
        error 
      }, 'WEEKLY_RANKING_SERVICE');
      return [];
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

export const weeklyRankingService = new WeeklyRankingService();

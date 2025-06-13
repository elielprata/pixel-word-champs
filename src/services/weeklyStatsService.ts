import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface WeeklyStats {
  totalParticipants: number;
  totalPrizePool: number;
  averageScore: number;
  totalGamesPlayed: number;
  weekStart: Date;
  weekEnd: Date;
}

export interface UserWeeklyStats {
  position: number | null;
  weeklyScore: number;
  prizeMoney: number;
  gamesPlayed: number;
  bestScore: number;
  maxLevel: number;
  weekStart: Date;
  weekEnd: Date;
}

class WeeklyStatsService {
  async getWeeklyStats(): Promise<WeeklyStats> {
    try {
      logger.debug('Calculando estatísticas semanais', undefined, 'WEEKLY_STATS_SERVICE');

      const startOfWeek = this.getStartOfWeek(new Date());
      const endOfWeek = this.getEndOfWeek(startOfWeek);

      // Buscar dados do ranking semanal
      const { data: rankingData, error: rankingError } = await supabase
        .from('weekly_rankings')
        .select('user_id, score, prize')
        .gte('week_start', startOfWeek.toISOString().split('T')[0])
        .lte('week_end', endOfWeek.toISOString().split('T')[0]);

      if (rankingError) {
        logger.error('Erro ao buscar dados do ranking para estatísticas', { 
          error: rankingError 
        }, 'WEEKLY_STATS_SERVICE');
        throw rankingError;
      }

      const totalParticipants = rankingData?.length || 0;
      const totalPrizePool = rankingData?.reduce((sum, entry) => sum + (entry.prize || 0), 0) || 0;
      const averageScore = totalParticipants > 0 
        ? (rankingData?.reduce((sum, entry) => sum + entry.score, 0) || 0) / totalParticipants 
        : 0;

      // Buscar dados de sessões de jogo da semana
      const { data: gameData, error: gameError } = await supabase
        .from('game_sessions')
        .select('total_score')
        .gte('created_at', startOfWeek.toISOString())
        .lte('created_at', endOfWeek.toISOString())
        .eq('status', 'completed');

      if (gameError) {
        logger.warn('Erro ao buscar dados de sessões para estatísticas', { 
          error: gameError 
        }, 'WEEKLY_STATS_SERVICE');
      }

      const totalGamesPlayed = gameData?.length || 0;

      const stats: WeeklyStats = {
        totalParticipants,
        totalPrizePool,
        averageScore: Math.round(averageScore),
        totalGamesPlayed,
        weekStart: startOfWeek,
        weekEnd: endOfWeek
      };

      logger.debug('Estatísticas semanais calculadas', { stats }, 'WEEKLY_STATS_SERVICE');

      return stats;
    } catch (error) {
      logger.error('Erro crítico ao calcular estatísticas semanais', { error }, 'WEEKLY_STATS_SERVICE');
      return {
        totalParticipants: 0,
        totalPrizePool: 0,
        averageScore: 0,
        totalGamesPlayed: 0,
        weekStart: new Date(),
        weekEnd: new Date()
      };
    }
  }

  async getUserWeeklyStats(userId: string): Promise<UserWeeklyStats> {
    try {
      logger.debug('Calculando estatísticas semanais do usuário', { userId }, 'WEEKLY_STATS_SERVICE');

      const startOfWeek = this.getStartOfWeek(new Date());
      const endOfWeek = this.getEndOfWeek(startOfWeek);

      // Buscar posição no ranking
      const { data: rankingData, error: rankingError } = await supabase
        .from('weekly_rankings')
        .select('position, score, prize')
        .eq('user_id', userId)
        .gte('week_start', startOfWeek.toISOString().split('T')[0])
        .lte('week_end', endOfWeek.toISOString().split('T')[0])
        .single();

      if (rankingError && rankingError.code !== 'PGRST116') {
        logger.error('Erro ao buscar ranking do usuário para estatísticas', { 
          userId, 
          error: rankingError 
        }, 'WEEKLY_STATS_SERVICE');
        throw rankingError;
      }

      // Buscar jogos da semana
      const { data: gamesData, error: gamesError } = await supabase
        .from('game_sessions')
        .select('total_score, level')
        .eq('user_id', userId)
        .gte('created_at', startOfWeek.toISOString())
        .lte('created_at', endOfWeek.toISOString())
        .eq('status', 'completed');

      if (gamesError) {
        logger.warn('Erro ao buscar jogos do usuário para estatísticas', { 
          userId, 
          error: gamesError 
        }, 'WEEKLY_STATS_SERVICE');
      }

      const gamesPlayed = gamesData?.length || 0;
      const bestScore = gamesData?.reduce((max, game) => Math.max(max, game.total_score || 0), 0) || 0;
      const maxLevel = gamesData?.reduce((max, game) => Math.max(max, game.level || 0), 0) || 0;

      const stats: UserWeeklyStats = {
        position: rankingData?.position || null,
        weeklyScore: rankingData?.score || 0,
        prizeMoney: rankingData?.prize || 0,
        gamesPlayed,
        bestScore,
        maxLevel,
        weekStart: startOfWeek,
        weekEnd: endOfWeek
      };

      logger.debug('Estatísticas semanais do usuário calculadas', { 
        userId, 
        stats 
      }, 'WEEKLY_STATS_SERVICE');

      return stats;
    } catch (error) {
      logger.error('Erro crítico ao calcular estatísticas semanais do usuário', { 
        userId, 
        error 
      }, 'WEEKLY_STATS_SERVICE');
      return {
        position: null,
        weeklyScore: 0,
        prizeMoney: 0,
        gamesPlayed: 0,
        bestScore: 0,
        maxLevel: 0,
        weekStart: new Date(),
        weekEnd: new Date()
      };
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

export const weeklyStatsService = new WeeklyStatsService();

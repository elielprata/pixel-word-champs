import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface WeeklyRankingData {
  position: number;
  username: string;
  score: number;
  prize: number;
  avatar_url: string | null;
}

export interface UserRankingPosition {
  position: number;
  score: number;
  prize: number;
}

export interface TopPlayerData {
  position: number;
  username: string;
  totalScore: number;
  avatar_url: string | null;
}

export interface RankingStats {
  weeklyParticipants: number;
  totalActivePlayers: number;
  weeklyPrizePool: number;
}

class RankingQueryService {
  async getWeeklyRanking(limit: number = 100): Promise<WeeklyRankingData[]> {
    try {
      logger.debug('Buscando ranking semanal', { limit }, 'RANKING_QUERY_SERVICE');

      const startOfWeek = this.getStartOfWeek(new Date());
      const endOfWeek = this.getEndOfWeek(startOfWeek);

      const { data, error } = await supabase
        .from('weekly_rankings')
        .select(`
          position,
          score,
          prize,
          profiles (
            username,
            avatar_url
          )
        `)
        .gte('week_start', startOfWeek.toISOString().split('T')[0])
        .lte('week_end', endOfWeek.toISOString().split('T')[0])
        .order('position', { ascending: true })
        .limit(limit);

      if (error) {
        logger.error('Erro ao buscar ranking semanal no banco de dados', { error }, 'RANKING_QUERY_SERVICE');
        throw error;
      }

      const rankings: WeeklyRankingData[] = (data || []).map(entry => ({
        position: entry.position,
        username: entry.profiles?.username || 'Usuário',
        score: entry.score,
        prize: entry.prize,
        avatar_url: entry.profiles?.avatar_url || null
      }));

      logger.debug('Ranking semanal carregado', { 
        entriesCount: rankings.length 
      }, 'RANKING_QUERY_SERVICE');

      return rankings;
    } catch (error) {
      logger.error('Erro crítico ao buscar ranking semanal', { error }, 'RANKING_QUERY_SERVICE');
      return [];
    }
  }

  async getUserRankingPosition(userId: string): Promise<UserRankingPosition | null> {
    try {
      logger.debug('Buscando posição do usuário no ranking', { userId }, 'RANKING_QUERY_SERVICE');

      const startOfWeek = this.getStartOfWeek(new Date());
      const endOfWeek = this.getEndOfWeek(startOfWeek);

      const { data, error } = await supabase
        .from('weekly_rankings')
        .select('position, score, prize')
        .eq('user_id', userId)
        .gte('week_start', startOfWeek.toISOString().split('T')[0])
        .lte('week_end', endOfWeek.toISOString().split('T')[0])
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.debug('Usuário não está no ranking semanal', { userId }, 'RANKING_QUERY_SERVICE');
          return null;
        }
        logger.error('Erro ao buscar posição do usuário no ranking', { 
          userId, 
          error 
        }, 'RANKING_QUERY_SERVICE');
        throw error;
      }

      const userPosition: UserRankingPosition = {
        position: data.position,
        score: data.score,
        prize: data.prize
      };

      logger.debug('Posição do usuário no ranking encontrada', { 
        userId, 
        position: userPosition.position 
      }, 'RANKING_QUERY_SERVICE');

      return userPosition;
    } catch (error) {
      logger.error('Erro crítico ao buscar posição do usuário', { 
        userId, 
        error 
      }, 'RANKING_QUERY_SERVICE');
      return null;
    }
  }

  async getTopPlayers(limit: number = 10): Promise<TopPlayerData[]> {
    try {
      logger.debug('Buscando top players', { limit }, 'RANKING_QUERY_SERVICE');

      const { data, error } = await supabase
        .from('profiles')
        .select('username, total_score, avatar_url')
        .order('total_score', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Erro ao buscar top players no banco de dados', { error }, 'RANKING_QUERY_SERVICE');
        throw error;
      }

      const topPlayers: TopPlayerData[] = (data || []).map((player, index) => ({
        position: index + 1,
        username: player.username || 'Usuário',
        totalScore: player.total_score || 0,
        avatar_url: player.avatar_url || null
      }));

      logger.debug('Top players carregados', { 
        playersCount: topPlayers.length 
      }, 'RANKING_QUERY_SERVICE');

      return topPlayers;
    } catch (error) {
      logger.error('Erro crítico ao buscar top players', { error }, 'RANKING_QUERY_SERVICE');
      return [];
    }
  }

  async getRankingStats(): Promise<RankingStats> {
    try {
      logger.debug('Calculando estatísticas do ranking', undefined, 'RANKING_QUERY_SERVICE');

      const startOfWeek = this.getStartOfWeek(new Date());
      const endOfWeek = this.getEndOfWeek(startOfWeek);

      // Total de participantes da semana
      const { count: weeklyCount, error: weeklyError } = await supabase
        .from('weekly_rankings')
        .select('*', { count: 'exact', head: true })
        .gte('week_start', startOfWeek.toISOString().split('T')[0])
        .lte('week_end', endOfWeek.toISOString().split('T')[0]);

      if (weeklyError) {
        logger.error('Erro ao contar participantes semanais', { error: weeklyError }, 'RANKING_QUERY_SERVICE');
        throw weeklyError;
      }

      // Total de usuários ativos
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('total_score', 0);

      if (usersError) {
        logger.error('Erro ao contar usuários ativos', { error: usersError }, 'RANKING_QUERY_SERVICE');
        throw usersError;
      }

      // Prêmio total da semana
      const { data: prizeData, error: prizeError } = await supabase
        .from('weekly_rankings')
        .select('prize')
        .gte('week_start', startOfWeek.toISOString().split('T')[0])
        .lte('week_end', endOfWeek.toISOString().split('T')[0]);

      if (prizeError) {
        logger.error('Erro ao buscar dados de prêmios', { error: prizeError }, 'RANKING_QUERY_SERVICE');
        throw prizeError;
      }

      const totalPrize = (prizeData || []).reduce((sum, entry) => sum + (entry.prize || 0), 0);

      const stats: RankingStats = {
        weeklyParticipants: weeklyCount || 0,
        totalActivePlayers: totalUsers || 0,
        weeklyPrizePool: totalPrize
      };

      logger.debug('Estatísticas do ranking calculadas', { stats }, 'RANKING_QUERY_SERVICE');

      return stats;
    } catch (error) {
      logger.error('Erro crítico ao calcular estatísticas do ranking', { error }, 'RANKING_QUERY_SERVICE');
      return {
        weeklyParticipants: 0,
        totalActivePlayers: 0,
        weeklyPrizePool: 0
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

export const rankingQueryService = new RankingQueryService();

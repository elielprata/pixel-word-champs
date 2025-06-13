
import { supabase } from '@/integrations/supabase/client';
import { RankingPlayer } from '@/types';
import { logger } from '@/utils/logger';

export class RankingQueryService {
  async getWeeklyRanking(): Promise<RankingPlayer[]> {
    try {
      logger.debug('Buscando ranking semanal baseado na pontuação total dos perfis', undefined, 'RANKING_QUERY_SERVICE');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, total_score')
        .gt('total_score', 0)
        .order('total_score', { ascending: false })
        .limit(100);

      if (error) {
        logger.error('Erro ao buscar ranking da tabela profiles', { error }, 'RANKING_QUERY_SERVICE');
        return [];
      }

      const rankings = data?.map((profile, index) => ({
        pos: index + 1,
        name: profile.username || 'Usuário',
        score: profile.total_score || 0,
        avatar_url: profile.avatar_url || undefined,
        user_id: profile.id
      })) || [];

      logger.info('Ranking semanal carregado com sucesso', { count: rankings.length }, 'RANKING_QUERY_SERVICE');
      return rankings;

    } catch (error) {
      logger.error('Erro ao buscar ranking semanal', { error }, 'RANKING_QUERY_SERVICE');
      return [];
    }
  }

  async getHistoricalRanking(userId: string): Promise<any[]> {
    try {
      logger.debug('Buscando histórico do usuário', { userId }, 'RANKING_QUERY_SERVICE');
      
      // Buscar histórico das competições finalizadas
      const { data: history, error } = await supabase
        .from('competition_history')
        .select('*')
        .eq('user_id', userId)
        .order('finalized_at', { ascending: false })
        .limit(10);

      if (error) {
        logger.error('Erro ao buscar histórico', { error }, 'RANKING_QUERY_SERVICE');
        return [];
      }

      const historical = history?.map((record) => ({
        week: record.competition_title,
        position: record.final_position,
        score: record.final_score,
        totalParticipants: record.total_participants,
        prize: record.prize_earned || 0,
        paymentStatus: record.prize_earned > 0 ? 'pending' : 'not_eligible'
      })) || [];

      logger.info('Histórico carregado', { userId, count: historical.length }, 'RANKING_QUERY_SERVICE');
      return historical;
    } catch (error) {
      logger.error('Erro ao buscar histórico', { userId, error }, 'RANKING_QUERY_SERVICE');
      return [];
    }
  }

  async getUserPosition(userId: string): Promise<number | null> {
    try {
      logger.debug('Buscando posição do usuário no ranking', { userId }, 'RANKING_QUERY_SERVICE');
      
      // Buscar ranking completo e encontrar posição do usuário
      const rankings = await this.getWeeklyRanking();
      const userIndex = rankings.findIndex(player => player.user_id === userId);
      const position = userIndex !== -1 ? userIndex + 1 : null;
      
      logger.debug('Posição do usuário calculada', { userId, position }, 'RANKING_QUERY_SERVICE');
      return position;
    } catch (error) {
      logger.error('Erro ao buscar posição do usuário', { userId, error }, 'RANKING_QUERY_SERVICE');
      return null;
    }
  }
}

export const rankingQueryService = new RankingQueryService();

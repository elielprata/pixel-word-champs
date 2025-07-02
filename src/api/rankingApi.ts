
import { supabase } from '@/integrations/supabase/client';
import { RankingPlayer } from '@/types';
import { logger } from '@/utils/logger';

export const rankingApi = {
  async getWeeklyRanking(): Promise<RankingPlayer[]> {
    try {
      logger.debug('Buscando ranking semanal usando função pública', undefined, 'RANKING_API');
      
      // Usar a função pública get_current_weekly_ranking (agora permite acesso público)
      const { data: rankingData, error: rankingError } = await supabase
        .rpc('get_current_weekly_ranking');

      if (rankingError) {
        logger.warn('Erro ao buscar ranking da função, tentando fallback', { error: rankingError }, 'RANKING_API');
      }

      if (rankingData && rankingData.length > 0) {
        const rankings = rankingData.map((item: any) => ({
          pos: item.position,
          name: item.username || 'Usuário',
          score: item.total_score || 0,
          user_id: item.user_id,
          avatar_url: item.avatar_url || undefined
        }));

        logger.info('Ranking semanal carregado da função', { count: rankings.length }, 'RANKING_API');
        return rankings;
      }

      // Fallback: buscar diretamente dos perfis se não houver ranking ativo
      logger.info('Ranking da função vazio, buscando dos perfis', undefined, 'RANKING_API');
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, total_score')
        .gt('total_score', 0)
        .order('total_score', { ascending: false })
        .limit(100);

      if (profilesError) {
        logger.error('Erro ao buscar perfis para ranking', { error: profilesError }, 'RANKING_API');
        return [];
      }

      const rankings = (profiles || []).map((profile, index) => ({
        pos: index + 1,
        name: profile.username || 'Usuário',
        score: profile.total_score || 0,
        avatar_url: profile.avatar_url || undefined,
        user_id: profile.id
      }));

      logger.info('Ranking carregado dos perfis', { count: rankings.length }, 'RANKING_API');
      return rankings;

    } catch (error) {
      logger.error('Erro inesperado ao carregar ranking', { error }, 'RANKING_API');
      return [];
    }
  },

  async getHistoricalRanking(userId: string): Promise<any[]> {
    try {
      logger.debug('Buscando histórico de competições', { userId }, 'RANKING_API');
      
      const { data: history, error } = await supabase
        .from('competition_history')
        .select('*')
        .eq('user_id', userId)
        .order('finalized_at', { ascending: false })
        .limit(10);

      if (error) {
        logger.error('Erro ao buscar histórico', { error }, 'RANKING_API');
        return [];
      }

      const historical = (history || []).map((record) => ({
        week: record.competition_title,
        position: record.final_position,
        score: record.final_score,
        totalParticipants: record.total_participants,
        prize: record.prize_earned || 0,
        paymentStatus: record.prize_earned > 0 ? 'pending' : 'not_eligible'
      }));

      logger.info('Histórico carregado', { userId, count: historical.length }, 'RANKING_API');
      return historical;
    } catch (error) {
      logger.error('Erro ao buscar histórico', { userId, error }, 'RANKING_API');
      return [];
    }
  }
};

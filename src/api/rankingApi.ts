
import { supabase } from '@/integrations/supabase/client';
import { RankingPlayer } from '@/types';
import { logger } from '@/utils/logger';

export const rankingApi = {
  async getWeeklyRanking(): Promise<RankingPlayer[]> {
    try {
      logger.debug('Buscando ranking semanal global', undefined, 'RANKING_API');
      
      // Calcular semana atual
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      // Buscar do ranking semanal primeiro
      const { data: weeklyData, error: weeklyError } = await supabase
        .from('weekly_rankings')
        .select('user_id, username, position, total_score')
        .eq('week_start', weekStartStr)
        .order('position', { ascending: true })
        .limit(100);

      if (weeklyError) {
        logger.error('Erro ao buscar weekly_rankings', { error: weeklyError }, 'RANKING_API');
      }

      if (weeklyData && weeklyData.length > 0) {
        const rankings = weeklyData.map((item) => ({
          pos: item.position,
          name: item.username || 'Usuário',
          score: item.total_score || 0,
          user_id: item.user_id,
          avatar_url: undefined
        }));

        logger.info('Ranking semanal carregado do weekly_rankings', { count: rankings.length }, 'RANKING_API');
        return rankings;
      }

      // Fallback: buscar diretamente dos perfis se weekly_rankings estiver vazio
      logger.info('Weekly_rankings vazio, buscando dos perfis', undefined, 'RANKING_API');
      
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
        .select('id, user_id, final_position, final_score, total_participants, prize_earned, competition_title')
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

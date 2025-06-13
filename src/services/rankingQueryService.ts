
import { supabase } from '@/integrations/supabase/client';
import { RankingPlayer } from '@/types';
import { logger } from '@/utils/logger';

export class RankingQueryService {
  async getWeeklyRanking(): Promise<RankingPlayer[]> {
    try {
      logger.debug('Buscando ranking semanal das participações', undefined, 'RANKING_QUERY_SERVICE');
      
      // Primeiro tentar buscar da tabela weekly_rankings
      const { data: weeklyRankings, error: weeklyError } = await supabase
        .from('weekly_rankings')
        .select('*')
        .order('position', { ascending: true })
        .limit(100);

      if (!weeklyError && weeklyRankings && weeklyRankings.length > 0) {
        const rankings = weeklyRankings.map((ranking) => ({
          pos: ranking.position,
          name: ranking.username || 'Usuário',
          score: ranking.total_score || 0,
          avatar_url: undefined,
          user_id: ranking.user_id
        }));

        logger.info('Ranking semanal carregado da tabela weekly_rankings', { count: rankings.length }, 'RANKING_QUERY_SERVICE');
        return rankings;
      }

      // Fallback: buscar da tabela de participações da competição ativa
      logger.debug('Fallback: buscando ranking das participações da competição ativa', undefined, 'RANKING_QUERY_SERVICE');
      
      const { data: competition, error: competitionError } = await supabase
        .from('custom_competitions')
        .select('id')
        .eq('competition_type', 'tournament')
        .eq('status', 'active')
        .maybeSingle();

      if (competitionError || !competition) {
        logger.warn('Nenhuma competição semanal ativa encontrada', { error: competitionError }, 'RANKING_QUERY_SERVICE');
        return this.getFallbackRanking();
      }

      const { data: participations, error: participationError } = await supabase
        .from('competition_participations')
        .select(`
          user_id,
          user_score,
          user_position
        `)
        .eq('competition_id', competition.id)
        .order('user_score', { ascending: false })
        .limit(100);

      if (participationError) {
        logger.error('Erro ao buscar participações da competição', { error: participationError }, 'RANKING_QUERY_SERVICE');
        return this.getFallbackRanking();
      }

      if (!participations || participations.length === 0) {
        logger.info('Nenhuma participação encontrada na competição semanal', undefined, 'RANKING_QUERY_SERVICE');
        return this.getFallbackRanking();
      }

      // Buscar perfis dos usuários separadamente
      const userIds = participations.map(p => p.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        logger.error('Erro ao buscar perfis dos usuários', { error: profilesError }, 'RANKING_QUERY_SERVICE');
        return this.getFallbackRanking();
      }

      const rankings = participations.map((participation, index) => {
        const profile = profiles?.find(p => p.id === participation.user_id);
        return {
          pos: participation.user_position || (index + 1),
          name: profile?.username || 'Usuário',
          score: participation.user_score || 0,
          avatar_url: profile?.avatar_url || undefined,
          user_id: participation.user_id
        };
      });

      logger.info('Ranking semanal carregado das participações', { count: rankings.length }, 'RANKING_QUERY_SERVICE');
      return rankings;

    } catch (error) {
      logger.error('Erro ao buscar ranking semanal', { error }, 'RANKING_QUERY_SERVICE');
      return this.getFallbackRanking();
    }
  }

  private async getFallbackRanking(): Promise<RankingPlayer[]> {
    try {
      logger.debug('Usando fallback: ranking baseado na pontuação total dos perfis', undefined, 'RANKING_QUERY_SERVICE');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, total_score')
        .gt('total_score', 0)
        .order('total_score', { ascending: false })
        .limit(50);

      if (error) {
        logger.error('Erro no fallback ranking', { error }, 'RANKING_QUERY_SERVICE');
        return [];
      }

      const rankings = data?.map((profile, index) => ({
        pos: index + 1,
        name: profile.username || 'Usuário',
        score: profile.total_score || 0,
        avatar_url: profile.avatar_url || undefined,
        user_id: profile.id
      })) || [];

      logger.info('Fallback ranking carregado', { count: rankings.length }, 'RANKING_QUERY_SERVICE');
      return rankings;
    } catch (error) {
      logger.error('Erro no fallback ranking', { error }, 'RANKING_QUERY_SERVICE');
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
      
      // Buscar da competição ativa primeiro
      const { data: competition, error: competitionError } = await supabase
        .from('custom_competitions')
        .select('id')
        .eq('competition_type', 'tournament')
        .eq('status', 'active')
        .maybeSingle();

      if (!competitionError && competition) {
        const { data: participation, error: participationError } = await supabase
          .from('competition_participations')
          .select('user_position')
          .eq('competition_id', competition.id)
          .eq('user_id', userId)
          .maybeSingle();

        if (!participationError && participation && participation.user_position) {
          logger.debug('Posição encontrada na competição ativa', { userId, position: participation.user_position }, 'RANKING_QUERY_SERVICE');
          return participation.user_position;
        }
      }

      // Fallback: calcular posição baseada na pontuação total
      const rankings = await this.getWeeklyRanking();
      const userIndex = rankings.findIndex(player => player.user_id === userId);
      const position = userIndex !== -1 ? userIndex + 1 : null;
      
      logger.debug('Posição calculada via fallback', { userId, position }, 'RANKING_QUERY_SERVICE');
      return position;
    } catch (error) {
      logger.error('Erro ao buscar posição do usuário', { userId, error }, 'RANKING_QUERY_SERVICE');
      return null;
    }
  }
}

export const rankingQueryService = new RankingQueryService();

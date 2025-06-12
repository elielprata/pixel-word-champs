
import { supabase } from '@/integrations/supabase/client';
import { RankingPlayer } from '@/types';
import { logger } from '@/utils/logger';

export class RankingQueryService {
  async getWeeklyRanking(): Promise<RankingPlayer[]> {
    try {
      logger.debug('Buscando ranking semanal dos perfis', undefined, 'RANKING_QUERY_SERVICE');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, total_score')
        .gt('total_score', 0)
        .order('total_score', { ascending: false })
        .limit(100);

      if (error) {
        logger.error('Erro ao buscar ranking semanal', { error }, 'RANKING_QUERY_SERVICE');
        throw error;
      }

      const rankings = data?.map((profile, index) => ({
        pos: index + 1,
        name: profile.username || 'Usuário',
        score: profile.total_score || 0,
        avatar_url: profile.avatar_url || undefined,
        user_id: profile.id
      })) || [];

      logger.info('Ranking semanal carregado', { count: rankings.length }, 'RANKING_QUERY_SERVICE');
      return rankings;
    } catch (error) {
      logger.error('Erro ao buscar ranking semanal', { error }, 'RANKING_QUERY_SERVICE');
      return [];
    }
  }

  async getHistoricalRanking(userId: string): Promise<any[]> {
    try {
      logger.debug('Buscando histórico simplificado do usuário', { userId }, 'RANKING_QUERY_SERVICE');
      
      // Para histórico, vamos retornar um mock simplificado baseado na pontuação atual
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('total_score')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        logger.warn('Perfil não encontrado para histórico', { userId, error }, 'RANKING_QUERY_SERVICE');
        return [];
      }

      // Criar histórico simplificado baseado na pontuação atual
      const currentScore = profile.total_score || 0;
      const historical = [];
      
      // Simular últimas 4 semanas
      for (let i = 0; i < 4; i++) {
        const weekScore = Math.max(0, currentScore - (i * 10)); // Simular evolução
        const position = weekScore > 50 ? 1 : weekScore > 30 ? 2 : weekScore > 10 ? 3 : 10;
        
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        historical.push({
          week: `Semana ${weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}-${weekEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`,
          position: position,
          score: weekScore,
          totalParticipants: 100,
          prize: position <= 3 ? [100, 50, 25][position - 1] : position <= 10 ? 10 : 0,
          paymentStatus: position <= 10 ? 'pending' : 'not_eligible'
        });
      }

      logger.info('Histórico simplificado gerado', { userId, count: historical.length }, 'RANKING_QUERY_SERVICE');
      return historical;
    } catch (error) {
      logger.error('Erro ao gerar histórico simplificado', { userId, error }, 'RANKING_QUERY_SERVICE');
      return [];
    }
  }

  async getUserPosition(userId: string): Promise<number | null> {
    try {
      logger.debug('Buscando posição do usuário no ranking', { userId }, 'RANKING_QUERY_SERVICE');
      
      // Buscar todos os perfis ordenados por pontuação
      const { data, error } = await supabase
        .from('profiles')
        .select('id, total_score')
        .gt('total_score', 0)
        .order('total_score', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar posição do usuário', { userId, error }, 'RANKING_QUERY_SERVICE');
        return null;
      }

      // Encontrar a posição do usuário
      const userIndex = data?.findIndex(profile => profile.id === userId);
      const position = userIndex !== -1 ? (userIndex || 0) + 1 : null;
      
      logger.debug('Posição do usuário encontrada', { userId, position }, 'RANKING_QUERY_SERVICE');
      return position;
    } catch (error) {
      logger.error('Erro ao buscar posição do usuário', { userId, error }, 'RANKING_QUERY_SERVICE');
      return null;
    }
  }
}

export const rankingQueryService = new RankingQueryService();

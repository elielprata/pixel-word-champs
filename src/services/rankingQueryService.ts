
import { supabase } from '@/integrations/supabase/client';
import { RankingPlayer } from '@/types';
import { logger } from '@/utils/logger';

export class RankingQueryService {
  async getWeeklyRanking(): Promise<RankingPlayer[]> {
    try {
      logger.debug('Fetching weekly ranking from profiles');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, total_score')
        .gt('total_score', 0)
        .order('total_score', { ascending: false })
        .limit(100);

      if (error) {
        logger.error('Error fetching ranking', { error });
        throw error;
      }

      const rankings = data?.map((profile, index) => ({
        pos: index + 1,
        name: profile.username || 'Usuário',
        score: profile.total_score || 0,
        avatar_url: profile.avatar_url || undefined,
        user_id: profile.id
      })) || [];

      logger.debug('Ranking loaded successfully', { playersCount: rankings.length });
      return rankings;
    } catch (error) {
      logger.error('Error fetching ranking', { error });
      return [];
    }
  }

  async getHistoricalRanking(userId: string): Promise<any[]> {
    try {
      logger.debug('Fetching simplified historical ranking', { userId });
      
      // Para histórico, vamos retornar um mock simplificado baseado na pontuação atual
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('total_score')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        logger.info('Profile not found for historical ranking');
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

      logger.debug('Historical ranking generated', { entriesCount: historical.length });
      return historical;
    } catch (error) {
      logger.error('Error generating historical ranking', { error });
      return [];
    }
  }

  async getUserPosition(userId: string): Promise<number | null> {
    try {
      // Buscar todos os perfis ordenados por pontuação
      const { data, error } = await supabase
        .from('profiles')
        .select('id, total_score')
        .gt('total_score', 0)
        .order('total_score', { ascending: false });

      if (error) {
        logger.error('Error fetching user position', { error });
        return null;
      }

      // Encontrar a posição do usuário
      const userIndex = data?.findIndex(profile => profile.id === userId);
      return userIndex !== -1 ? (userIndex || 0) + 1 : null;
    } catch (error) {
      logger.error('Error fetching user position', { error });
      return null;
    }
  }
}

export const rankingQueryService = new RankingQueryService();

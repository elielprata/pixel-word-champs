import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface CompetitionHistoryData {
  competitionId: string;
  competitionTitle: string;
  competitionType: string;
  userId: string;
  finalScore: number;
  finalPosition: number;
  totalParticipants: number;
  prizeEarned: number;
  competitionStartDate: string;
  competitionEndDate: string;
}

class CompetitionHistoryService {
  async saveCompetitionHistory(historyData: CompetitionHistoryData[]): Promise<void> {
    try {
      logger.info('Salvando histórico de competições', { count: historyData.length }, 'COMPETITION_HISTORY_SERVICE');

      const historyRecords = historyData.map(data => ({
        competition_id: data.competitionId,
        competition_title: data.competitionTitle,
        competition_type: data.competitionType,
        user_id: data.userId,
        final_score: data.finalScore,
        final_position: data.finalPosition,
        total_participants: data.totalParticipants,
        prize_earned: data.prizeEarned,
        competition_start_date: data.competitionStartDate,
        competition_end_date: data.competitionEndDate,
        finalized_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('competition_history')
        .insert(historyRecords);

      if (error) {
        logger.error('Erro ao salvar histórico de competições', { error }, 'COMPETITION_HISTORY_SERVICE');
        throw error;
      }

      logger.info('Histórico de competições salvo com sucesso', { count: historyRecords.length }, 'COMPETITION_HISTORY_SERVICE');
    } catch (error) {
      logger.error('Erro ao salvar histórico de competições', { error }, 'COMPETITION_HISTORY_SERVICE');
    }
  }

  async getCompetitionHistory(competitionId?: string, userId?: string): Promise<any[]> {
    try {
      logger.debug('Buscando histórico de competições', { competitionId, userId }, 'COMPETITION_HISTORY_SERVICE');
      
      let query = supabase
        .from('competition_history')
        .select('*')
        .order('finalized_at', { ascending: false });

      if (competitionId) {
        query = query.eq('competition_id', competitionId);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Erro ao buscar histórico de competições', { error }, 'COMPETITION_HISTORY_SERVICE');
        throw error;
      }

      logger.debug('Histórico de competições carregado', { count: data?.length || 0 }, 'COMPETITION_HISTORY_SERVICE');
      return data || [];
    } catch (error) {
      logger.error('Erro ao buscar histórico de competições', { error }, 'COMPETITION_HISTORY_SERVICE');
      return [];
    }
  }

  async getUserCompetitionStats(userId: string): Promise<any> {
    try {
      logger.debug('Buscando estatísticas de competições do usuário', { userId }, 'COMPETITION_HISTORY_SERVICE');
      
      const { data, error } = await supabase
        .from('competition_history')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        logger.error('Erro ao buscar estatísticas do usuário', { userId, error }, 'COMPETITION_HISTORY_SERVICE');
        return null;
      }

      const competitions = data || [];
      const totalCompetitions = competitions.length;
      const totalPrizes = competitions.reduce((sum, comp) => sum + (comp.prize_earned || 0), 0);
      const bestPosition = competitions.length > 0 
        ? Math.min(...competitions.map(comp => comp.final_position))
        : null;

      const stats = {
        totalCompetitions,
        totalPrizes,
        bestPosition,
        competitions
      };

      logger.debug('Estatísticas do usuário calculadas', { userId, stats }, 'COMPETITION_HISTORY_SERVICE');
      return stats;
    } catch (error) {
      logger.error('Erro ao calcular estatísticas do usuário', { userId, error }, 'COMPETITION_HISTORY_SERVICE');
      return null;
    }
  }
}

export const competitionHistoryService = new CompetitionHistoryService();

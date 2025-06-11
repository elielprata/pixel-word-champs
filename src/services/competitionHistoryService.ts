
import { supabase } from '@/integrations/supabase/client';

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
      console.log('💾 Salvando histórico da competição para', historyData.length, 'participantes');

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
        console.error('❌ Erro ao salvar histórico:', error);
        throw error;
      }

      console.log('✅ Histórico da competição salvo com sucesso');
    } catch (error) {
      console.error('❌ Erro no serviço de histórico:', error);
      throw error;
    }
  }

  async getCompetitionHistory(competitionId?: string, userId?: string): Promise<any[]> {
    try {
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
        console.error('❌ Erro ao buscar histórico:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar histórico de competições:', error);
      return [];
    }
  }

  async getUserCompetitionStats(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('competition_history')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Erro ao buscar estatísticas do usuário:', error);
        return null;
      }

      const competitions = data || [];
      const totalCompetitions = competitions.length;
      const totalPrizes = competitions.reduce((sum, comp) => sum + (comp.prize_earned || 0), 0);
      const bestPosition = competitions.length > 0 
        ? Math.min(...competitions.map(comp => comp.final_position))
        : null;

      return {
        totalCompetitions,
        totalPrizes,
        bestPosition,
        competitions
      };
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      return null;
    }
  }
}

export const competitionHistoryService = new CompetitionHistoryService();

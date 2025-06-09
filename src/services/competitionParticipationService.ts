
import { supabase } from '@/integrations/supabase/client';

/**
 * Serviço para gerenciar participações em competições
 */
class CompetitionParticipationService {
  async checkUserParticipation(userId: string, competitionId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('competition_participations')
        .select('id')
        .eq('competition_id', competitionId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar participação:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('❌ Erro ao verificar participação:', error);
      return false;
    }
  }

  async createParticipation(competitionId: string, userId: string): Promise<void> {
    const { error: participationError } = await supabase
      .from('competition_participations')
      .insert({
        competition_id: competitionId,
        user_id: userId,
        user_score: 0,
        user_position: null,
        payment_status: 'not_eligible'
      });

    if (participationError) {
      console.error('❌ Erro ao criar participação:', participationError);
      throw participationError;
    }
  }

  async updateParticipationScore(competitionId: string, userId: string, totalScore: number): Promise<void> {
    const { error: updateError } = await supabase
      .from('competition_participations')
      .update({ user_score: totalScore })
      .eq('competition_id', competitionId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ Erro ao atualizar pontuação:', updateError);
      throw updateError;
    }
  }

  async updateCompetitionRankings(competitionId: string): Promise<void> {
    try {
      console.log('🏆 Atualizando rankings da competição diária...');
      
      const { data: participations, error } = await supabase
        .from('competition_participations')
        .select('id, user_id, user_score')
        .eq('competition_id', competitionId)
        .order('user_score', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar participações:', error);
        return;
      }

      const updates = participations?.map((participation, index) => ({
        id: participation.id,
        user_position: index + 1
      })) || [];

      for (const update of updates) {
        await supabase
          .from('competition_participations')
          .update({ user_position: update.user_position })
          .eq('id', update.id);
      }

      console.log('✅ Rankings da competição diária atualizados');
    } catch (error) {
      console.error('❌ Erro ao atualizar rankings:', error);
    }
  }
}

export const competitionParticipationService = new CompetitionParticipationService();

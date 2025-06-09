
import { supabase } from '@/integrations/supabase/client';
import { competitionParticipationService } from './competitionParticipationService';

/**
 * Serviço para finalização de competições
 */
class CompetitionFinalizationService {
  async finalizeDailyCompetition(competitionId: string): Promise<void> {
    try {
      console.log('🏁 Finalizando competição diária e transferindo pontos...');

      const { data: competition, error: compError } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('id', competitionId)
        .single();

      if (compError || !competition) {
        console.error('❌ Competição não encontrada:', compError);
        return;
      }

      const { data: weeklyCompetition, error: weeklyError } = await supabase
        .from('custom_competitions')
        .select('id')
        .eq('competition_type', 'tournament')
        .eq('status', 'active')
        .single();

      if (weeklyError || !weeklyCompetition) {
        console.log('⚠️ Nenhuma competição semanal ativa encontrada para transferir pontos');
      }

      const { data: participations, error: partError } = await supabase
        .from('competition_participations')
        .select('user_id, user_score')
        .eq('competition_id', competitionId)
        .gt('user_score', 0);

      if (partError) {
        console.error('❌ Erro ao buscar participações:', partError);
        return;
      }

      if (weeklyCompetition && participations && participations.length > 0) {
        await this.transferPointsToWeeklyCompetition(weeklyCompetition.id, participations);
        await competitionParticipationService.updateCompetitionRankings(weeklyCompetition.id);
      }

      await supabase
        .from('competition_participations')
        .update({ user_score: 0 })
        .eq('competition_id', competitionId);

      await supabase
        .from('custom_competitions')
        .update({ status: 'completed' })
        .eq('id', competitionId);

      console.log('✅ Competição diária finalizada e pontos transferidos');
    } catch (error) {
      console.error('❌ Erro ao finalizar competição diária:', error);
    }
  }

  private async transferPointsToWeeklyCompetition(weeklyCompetitionId: string, participations: any[]): Promise<void> {
    for (const participation of participations) {
      const { data: existingWeeklyParticipation, error: checkError } = await supabase
        .from('competition_participations')
        .select('id, user_score')
        .eq('competition_id', weeklyCompetitionId)
        .eq('user_id', participation.user_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar participação semanal:', checkError);
        continue;
      }

      if (existingWeeklyParticipation) {
        const newScore = existingWeeklyParticipation.user_score + participation.user_score;
        await supabase
          .from('competition_participations')
          .update({ user_score: newScore })
          .eq('id', existingWeeklyParticipation.id);
      } else {
        await supabase
          .from('competition_participations')
          .insert({
            competition_id: weeklyCompetitionId,
            user_id: participation.user_id,
            user_score: participation.user_score,
            user_position: null,
            payment_status: 'pending'
          });
      }

      console.log(`✅ Pontos transferidos para usuário ${participation.user_id}: ${participation.user_score} pontos`);
    }
  }
}

export const competitionFinalizationService = new CompetitionFinalizationService();

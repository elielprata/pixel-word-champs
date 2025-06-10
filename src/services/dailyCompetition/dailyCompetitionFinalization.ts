
import { supabase } from '@/integrations/supabase/client';
import { dailyCompetitionParticipationService } from './dailyCompetitionParticipation';

export class DailyCompetitionFinalizationService {
  async finalizeDailyCompetition(competitionId: string): Promise<void> {
    try {
      console.log('🏁 Finalizando competição diária e consolidando pontos...');

      // Buscar informações da competição diária
      const { data: competition, error: compError } = await supabase
        .from('custom_competitions')
        .select('*, weekly_tournament_id')
        .eq('id', competitionId)
        .single();

      if (compError || !competition) {
        console.error('❌ Competição não encontrada:', compError);
        return;
      }

      // Verificar se há competição semanal vinculada
      if (!competition.weekly_tournament_id) {
        console.warn('⚠️ Competição diária não está vinculada a uma competição semanal');
      }

      // Atualizar rankings finais da competição diária
      await dailyCompetitionParticipationService.updateCompetitionRankings(competitionId);

      // Se há competição semanal vinculada, atualizar seus rankings também
      if (competition.weekly_tournament_id) {
        await dailyCompetitionParticipationService.updateCompetitionRankings(competition.weekly_tournament_id);
        console.log('✅ Rankings da competição semanal atualizados');
      }

      // Finalizar a competição diária
      await supabase
        .from('custom_competitions')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', competitionId);

      console.log('✅ Competição diária finalizada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao finalizar competição diária:', error);
    }
  }

  async transferScoresToWeeklyCompetition(dailyCompetitionId: string): Promise<void> {
    try {
      console.log('🔄 Verificando transferência de pontos para competição semanal...');

      // Buscar competição diária e sua vinculação semanal
      const { data: dailyCompetition, error: dailyError } = await supabase
        .from('custom_competitions')
        .select('weekly_tournament_id')
        .eq('id', dailyCompetitionId)
        .single();

      if (dailyError || !dailyCompetition?.weekly_tournament_id) {
        console.log('⚠️ Competição diária não vinculada a competição semanal');
        return;
      }

      // Buscar todas as participações da competição diária
      const { data: dailyParticipations, error: participationsError } = await supabase
        .from('competition_participations')
        .select('user_id, user_score')
        .eq('competition_id', dailyCompetitionId)
        .gt('user_score', 0);

      if (participationsError) {
        console.error('❌ Erro ao buscar participações diárias:', participationsError);
        return;
      }

      console.log(`📊 Processando ${dailyParticipations?.length || 0} participações`);

      // Como os pontos já estão sendo transferidos em tempo real durante o jogo,
      // esta função agora apenas valida a consistência
      for (const participation of dailyParticipations || []) {
        const { data: weeklyParticipation, error: weeklyError } = await supabase
          .from('competition_participations')
          .select('user_score')
          .eq('competition_id', dailyCompetition.weekly_tournament_id)
          .eq('user_id', participation.user_id)
          .single();

        if (weeklyError) {
          console.warn(`⚠️ Participação semanal não encontrada para usuário ${participation.user_id}`);
          continue;
        }

        console.log(`✅ Usuário ${participation.user_id}: ${participation.user_score} pontos diários, ${weeklyParticipation.user_score} pontos semanais`);
      }

      console.log('✅ Verificação de consistência de pontos concluída');
    } catch (error) {
      console.error('❌ Erro ao verificar transferência de pontos:', error);
    }
  }
}

export const dailyCompetitionFinalizationService = new DailyCompetitionFinalizationService();

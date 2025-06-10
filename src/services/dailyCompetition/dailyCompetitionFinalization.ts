
import { supabase } from '@/integrations/supabase/client';
import { dailyCompetitionParticipationService } from './dailyCompetitionParticipation';

export class DailyCompetitionFinalizationService {
  async finalizeDailyCompetition(competitionId: string): Promise<void> {
    try {
      console.log('🏁 Finalizando competição diária (nova dinâmica - sem ranking diário)...');

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
        console.error('❌ Competição diária não está vinculada a uma competição semanal');
        return;
      }

      // Como não há ranking diário separado, atualizar apenas os rankings da competição semanal
      await dailyCompetitionParticipationService.updateCompetitionRankings(competition.weekly_tournament_id);
      console.log('✅ Rankings da competição semanal atualizados');

      // Finalizar a competição diária
      await supabase
        .from('custom_competitions')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', competitionId);

      console.log('✅ Competição diária finalizada com sucesso (pontos já na competição semanal)');
    } catch (error) {
      console.error('❌ Erro ao finalizar competição diária:', error);
    }
  }

  async transferScoresToWeeklyCompetition(dailyCompetitionId: string): Promise<void> {
    try {
      console.log('ℹ️ Com a nova dinâmica, não há transferência de pontos - os pontos já são contabilizados diretamente na competição semanal');

      // Buscar competição diária e sua vinculação semanal para validação
      const { data: dailyCompetition, error: dailyError } = await supabase
        .from('custom_competitions')
        .select('weekly_tournament_id, title')
        .eq('id', dailyCompetitionId)
        .single();

      if (dailyError || !dailyCompetition?.weekly_tournament_id) {
        console.log('⚠️ Competição diária não vinculada a competição semanal');
        return;
      }

      console.log(`✅ Competição diária "${dailyCompetition.title || 'Sem título'}" está corretamente vinculada à competição semanal`);
      console.log('ℹ️ Os pontos são transferidos automaticamente em tempo real durante o jogo');
    } catch (error) {
      console.error('❌ Erro ao verificar vinculação:', error);
    }
  }
}

export const dailyCompetitionFinalizationService = new DailyCompetitionFinalizationService();

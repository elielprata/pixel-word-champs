
import { supabase } from '@/integrations/supabase/client';
import { competitionParticipationService } from './competitionParticipationService';
import { dailyCompetitionFinalizationService } from './dailyCompetition/dailyCompetitionFinalization';

/**
 * Serviço para finalização de competições - atualizado para nova dinâmica
 */
class CompetitionFinalizationService {
  async finalizeDailyCompetition(competitionId: string): Promise<void> {
    try {
      console.log('🏁 Finalizando competição diária com nova dinâmica...');

      // Usar o novo serviço específico para competições diárias
      await dailyCompetitionFinalizationService.finalizeDailyCompetition(competitionId);
      
      console.log('✅ Competição diária finalizada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao finalizar competição diária:', error);
    }
  }

  async finalizeWeeklyCompetition(competitionId: string): Promise<void> {
    try {
      console.log('🏁 Finalizando competição semanal...');

      // Atualizar rankings finais
      await competitionParticipationService.updateCompetitionRankings(competitionId);

      // Finalizar a competição
      await supabase
        .from('custom_competitions')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', competitionId);

      // Buscar e finalizar todas as competições diárias vinculadas
      const { data: linkedDailyCompetitions, error: linkedError } = await supabase
        .from('custom_competitions')
        .select('id')
        .eq('weekly_tournament_id', competitionId)
        .eq('status', 'active');

      if (!linkedError && linkedDailyCompetitions) {
        for (const dailyComp of linkedDailyCompetitions) {
          await this.finalizeDailyCompetition(dailyComp.id);
        }
        console.log(`✅ ${linkedDailyCompetitions.length} competições diárias vinculadas finalizadas`);
      }

      console.log('✅ Competição semanal finalizada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao finalizar competição semanal:', error);
    }
  }

  private async transferPointsToWeeklyCompetition(weeklyCompetitionId: string, participations: any[]): Promise<void> {
    // Este método não é mais necessário com a nova dinâmica,
    // pois os pontos são transferidos em tempo real durante o jogo
    console.log('ℹ️ Transferência de pontos não necessária - pontos já transferidos em tempo real');
  }
}

export const competitionFinalizationService = new CompetitionFinalizationService();

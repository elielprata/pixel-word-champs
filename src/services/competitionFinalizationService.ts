
import { supabase } from '@/integrations/supabase/client';
import { competitionParticipationService } from './competitionParticipationService';
import { dailyCompetitionFinalizationService } from './dailyCompetition/dailyCompetitionFinalization';
import { weeklyCompetitionFinalizationService } from './weeklyCompetitionFinalizationService';

/**
 * Serviço para finalização de competições com nova regra de histórico
 */
class CompetitionFinalizationService {
  async finalizeDailyCompetition(competitionId: string): Promise<void> {
    try {
      console.log('🏁 Finalizando competição diária (nova dinâmica - pontos já na semanal)...');

      // Usar o serviço específico para competições diárias
      await dailyCompetitionFinalizationService.finalizeDailyCompetition(competitionId);
      
      console.log('✅ Competição diária finalizada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao finalizar competição diária:', error);
    }
  }

  async finalizeWeeklyCompetition(competitionId: string): Promise<void> {
    try {
      console.log('🏁 Finalizando competição semanal com nova regra de histórico...');

      // Usar o novo serviço com regras de finalização automática
      await weeklyCompetitionFinalizationService.finalizeWeeklyCompetition(competitionId);

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

      console.log('✅ Competição semanal finalizada com histórico salvo e pontuações zeradas');
    } catch (error) {
      console.error('❌ Erro ao finalizar competição semanal:', error);
    }
  }
}

export const competitionFinalizationService = new CompetitionFinalizationService();


import { supabase } from '@/integrations/supabase/client';

export class DailyCompetitionFinalizationService {
  async finalizeDailyCompetition(competitionId: string): Promise<void> {
    try {
      console.log('🏁 Finalizando competição diária independente...');

      // Buscar informações da competição diária
      const { data: competition, error: compError } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('id', competitionId)
        .single();

      if (compError || !competition) {
        console.error('❌ Competição não encontrada:', compError);
        return;
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
      console.log('ℹ️ Ranking semanal será atualizado automaticamente baseado nas pontuações dos perfis');
    } catch (error) {
      console.error('❌ Erro ao finalizar competição diária:', error);
    }
  }

  async transferScoresToWeeklyCompetition(dailyCompetitionId: string): Promise<void> {
    try {
      console.log('ℹ️ Função obsoleta - competições diárias agora são independentes');
      console.log('ℹ️ Os pontos vão diretamente para o total_score do perfil do usuário');
      console.log('ℹ️ O ranking semanal é atualizado automaticamente baseado no total_score');
    } catch (error) {
      console.error('❌ Erro na função obsoleta:', error);
    }
  }
}

export const dailyCompetitionFinalizationService = new DailyCompetitionFinalizationService();

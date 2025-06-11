
import { supabase } from '@/integrations/supabase/client';
import { competitionHistoryService } from './competitionHistoryService';

class WeeklyCompetitionFinalizationService {
  async finalizeWeeklyCompetition(competitionId: string): Promise<void> {
    try {
      console.log('🏁 Iniciando finalização da competição semanal:', competitionId);

      // 1. Buscar dados da competição
      const { data: competition, error: compError } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('id', competitionId)
        .single();

      if (compError || !competition) {
        throw new Error('Competição não encontrada');
      }

      // 2. Buscar todas as participações com dados dos usuários
      const { data: participations, error: participationError } = await supabase
        .from('competition_participations')
        .select(`
          *,
          profiles:user_id (
            id,
            username
          )
        `)
        .eq('competition_id', competitionId)
        .order('user_score', { ascending: false });

      if (participationError) {
        throw new Error('Erro ao buscar participações');
      }

      if (!participations || participations.length === 0) {
        console.log('⚠️ Nenhuma participação encontrada para finalizar');
        return;
      }

      console.log(`📊 Finalizando competição com ${participations.length} participantes`);

      // 3. Calcular prêmios baseado nas posições
      const participationsWithPrizes = participations.map((participation, index) => {
        const position = index + 1;
        let prize = 0;

        // Distribuição de prêmios padrão
        if (position === 1) prize = 100;
        else if (position === 2) prize = 50;
        else if (position === 3) prize = 25;
        else if (position <= 10) prize = 10;

        return {
          ...participation,
          final_position: position,
          prize_earned: prize
        };
      });

      // 4. Salvar no histórico da competição
      const historyData = participationsWithPrizes.map(participation => ({
        competitionId: competition.id,
        competitionTitle: competition.title,
        competitionType: competition.competition_type,
        userId: participation.user_id,
        finalScore: participation.user_score || 0,
        finalPosition: participation.final_position,
        totalParticipants: participations.length,
        prizeEarned: participation.prize_earned,
        competitionStartDate: competition.start_date,
        competitionEndDate: competition.end_date
      }));

      await competitionHistoryService.saveCompetitionHistory(historyData);

      // 5. Atualizar prêmios nas participações atuais
      for (const participation of participationsWithPrizes) {
        if (participation.prize_earned > 0) {
          await supabase
            .from('competition_participations')
            .update({ 
              prize: participation.prize_earned,
              user_position: participation.final_position
            })
            .eq('id', participation.id);
        }
      }

      // 6. Zerar pontuações de todos os participantes para próxima competição
      console.log('🔄 Zerando pontuações dos participantes...');
      
      const userIds = participations.map(p => p.user_id);
      
      const { error: resetError } = await supabase
        .from('profiles')
        .update({ total_score: 0 })
        .in('id', userIds);

      if (resetError) {
        console.error('❌ Erro ao zerar pontuações:', resetError);
        // Não falhar a finalização por causa disso, apenas logar
      } else {
        console.log('✅ Pontuações dos participantes zeradas com sucesso');
      }

      // 7. Marcar competição como finalizada
      await supabase
        .from('custom_competitions')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', competitionId);

      console.log('✅ Competição semanal finalizada com sucesso');
      console.log(`📈 Histórico salvo para ${participations.length} participantes`);
      console.log('🔄 Participantes prontos para nova competição');

    } catch (error) {
      console.error('❌ Erro ao finalizar competição semanal:', error);
      throw error;
    }
  }

  async resetUserScoresForNewCompetition(userIds: string[]): Promise<void> {
    try {
      console.log('🔄 Zerando pontuações para nova competição...');

      const { error } = await supabase
        .from('profiles')
        .update({ total_score: 0 })
        .in('id', userIds);

      if (error) {
        console.error('❌ Erro ao zerar pontuações:', error);
        throw error;
      }

      console.log(`✅ Pontuações zeradas para ${userIds.length} usuários`);
    } catch (error) {
      console.error('❌ Erro no reset de pontuações:', error);
      throw error;
    }
  }
}

export const weeklyCompetitionFinalizationService = new WeeklyCompetitionFinalizationService();

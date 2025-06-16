
import { supabase } from '@/integrations/supabase/client';
import { competitionHistoryService } from './competitionHistoryService';
import { dynamicPrizeService } from './dynamicPrizeService';
import { weeklyPositionService } from './weeklyPositionService';
import { logger } from '@/utils/logger';

class WeeklyCompetitionFinalizationService {
  async finalizeWeeklyCompetition(competitionId: string): Promise<void> {
    try {
      logger.log('🏁 Iniciando finalização da competição semanal:', competitionId);

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
        logger.log('⚠️ Nenhuma participação encontrada para finalizar');
        return;
      }

      logger.log(`📊 Finalizando competição com ${participations.length} participantes`);

      // 3. Calcular prêmios dinamicamente baseado nas configurações
      const participantsData = participations.map(p => ({
        user_id: p.user_id,
        user_score: p.user_score || 0
      }));

      const participantsWithPrizes = await dynamicPrizeService.calculateDynamicPrizes(participantsData);

      logger.log('🎯 Prêmios calculados dinamicamente:', {
        totalParticipants: participantsWithPrizes.length,
        winnersCount: participantsWithPrizes.filter(p => p.prize > 0).length,
        totalPrizePool: participantsWithPrizes.reduce((sum, p) => sum + p.prize, 0)
      });

      // 4. Mapear dados para o histórico
      const historyData = participantsWithPrizes.map(participant => {
        const originalParticipation = participations.find(p => p.user_id === participant.user_id);
        
        return {
          competitionId: competition.id,
          competitionTitle: competition.title,
          competitionType: competition.competition_type,
          userId: participant.user_id,
          finalScore: participant.score,
          finalPosition: participant.position,
          totalParticipants: participations.length,
          prizeEarned: participant.prize,
          competitionStartDate: competition.start_date,
          competitionEndDate: competition.end_date
        };
      });

      // 5. Salvar no histórico da competição
      await competitionHistoryService.saveCompetitionHistory(historyData);

      // 6. Atualizar prêmios nas participações atuais
      for (const participant of participantsWithPrizes) {
        if (participant.prize > 0) {
          const originalParticipation = participations.find(p => p.user_id === participant.user_id);
          
          if (originalParticipation) {
            await supabase
              .from('competition_participations')
              .update({ 
                prize: participant.prize,
                user_position: participant.position
              })
              .eq('id', originalParticipation.id);
          }
        }
      }

      // 7. Marcar competição como finalizada
      await supabase
        .from('custom_competitions')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', competitionId);

      // 8. Executar reset automático das melhores posições semanais
      try {
        await weeklyPositionService.resetWeeklyScoresAndPositions();
        logger.log('✅ Reset das pontuações e melhores posições semanais executado');
      } catch (resetError) {
        logger.error('❌ Erro ao executar reset das melhores posições:', resetError);
      }

      // 9. Verificar se deve executar reset automático
      await this.checkAndExecuteAutomaticReset(competition);

      logger.log('✅ Competição semanal finalizada com sucesso');
      logger.log(`📈 Histórico salvo para ${participations.length} participantes`);
      logger.log(`💰 Total de prêmios distribuídos: R$ ${participantsWithPrizes.reduce((sum, p) => sum + p.prize, 0)}`);
      logger.log(`🏆 Ganhadores: ${participantsWithPrizes.filter(p => p.prize > 0).length}`);

    } catch (error) {
      logger.error('❌ Erro ao finalizar competição semanal:', error);
      throw error;
    }
  }

  private async checkAndExecuteAutomaticReset(competition: any): Promise<void> {
    try {
      logger.log('🔍 Verificando configurações de reset automático...');

      // Buscar configurações de automação
      const { data: settingsData, error: settingsError } = await supabase
        .from('game_settings')
        .select('setting_value')
        .eq('setting_key', 'reset_automation_config')
        .maybeSingle();

      if (settingsError || !settingsData?.setting_value) {
        logger.log('ℹ️ Nenhuma configuração de automação encontrada');
        return;
      }

      const config = JSON.parse(settingsData.setting_value);
      
      // Verificar se deve fazer reset por finalização de competição
      if (!config.enabled || config.triggerType !== 'competition_finalization') {
        logger.log('ℹ️ Reset por finalização de competição não está ativado');
        return;
      }

      logger.log('🚀 Executando reset automático por finalização de competição...');

      // Chamar a Edge Function para fazer o reset
      const { data, error } = await supabase.functions.invoke('automation-reset-checker', {
        body: { 
          competition_finalization: true,
          competition_id: competition.id,
          competition_title: competition.title
        }
      });

      if (error) {
        logger.error('❌ Erro ao executar reset automático:', error);
      } else {
        logger.log('✅ Reset automático executado com sucesso:', data);
      }

    } catch (error) {
      logger.error('❌ Erro ao verificar/executar reset automático:', error);
    }
  }

  async resetUserScoresForNewCompetition(userIds: string[]): Promise<void> {
    try {
      logger.log('🔄 Zerando pontuações para nova competição...');

      const { error } = await supabase
        .from('profiles')
        .update({ total_score: 0 })
        .in('id', userIds);

      if (error) {
        logger.error('❌ Erro ao zerar pontuações:', error);
        throw error;
      }

      logger.log(`✅ Pontuações zeradas para ${userIds.length} usuários`);
    } catch (error) {
      logger.error('❌ Erro no reset de pontuações:', error);
      throw error;
    }
  }
}

export const weeklyCompetitionFinalizationService = new WeeklyCompetitionFinalizationService();

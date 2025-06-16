
import { supabase } from '@/integrations/supabase/client';
import { competitionHistoryService } from './competitionHistoryService';
import { dynamicPrizeService } from './dynamicPrizeService';
import { logger } from '@/utils/logger';

class OrphanedDataRecoveryService {
  async recoverOrphanedCompetitions(): Promise<void> {
    try {
      logger.info('🔍 Iniciando recuperação de dados orfãos', undefined, 'ORPHANED_DATA_RECOVERY');

      // Buscar competições finalizadas sem dados no histórico
      const { data: completedCompetitions, error: compError } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('status', 'completed')
        .eq('competition_type', 'tournament');

      if (compError) {
        logger.error('Erro ao buscar competições finalizadas', { error: compError }, 'ORPHANED_DATA_RECOVERY');
        return;
      }

      if (!completedCompetitions || completedCompetitions.length === 0) {
        logger.info('Nenhuma competição finalizada encontrada', undefined, 'ORPHANED_DATA_RECOVERY');
        return;
      }

      for (const competition of completedCompetitions) {
        await this.recoverCompetitionData(competition);
      }

      logger.info('✅ Recuperação de dados orfãos concluída', undefined, 'ORPHANED_DATA_RECOVERY');
    } catch (error) {
      logger.error('❌ Erro na recuperação de dados orfãos', { error }, 'ORPHANED_DATA_RECOVERY');
    }
  }

  private async recoverCompetitionData(competition: any): Promise<void> {
    try {
      logger.info('🔧 Recuperando dados da competição', {
        id: competition.id,
        title: competition.title,
        periodo: `${competition.start_date} a ${competition.end_date}`
      }, 'ORPHANED_DATA_RECOVERY');

      // Verificar se já existe histórico para esta competição
      const existingHistory = await competitionHistoryService.getCompetitionHistory(competition.id);
      
      if (existingHistory.length > 0) {
        logger.info('Competição já tem histórico salvo, pulando', {
          id: competition.id,
          historicoCount: existingHistory.length
        }, 'ORPHANED_DATA_RECOVERY');
        return;
      }

      // Buscar participações existentes na tabela competition_participations
      const { data: participations, error: partError } = await supabase
        .from('competition_participations')
        .select(`
          *,
          profiles:user_id (
            id,
            username
          )
        `)
        .eq('competition_id', competition.id)
        .order('user_score', { ascending: false });

      if (partError) {
        logger.error('Erro ao buscar participações', { 
          competitionId: competition.id, 
          error: partError 
        }, 'ORPHANED_DATA_RECOVERY');
        return;
      }

      if (!participations || participations.length === 0) {
        logger.warn('Nenhuma participação encontrada para recuperar', {
          competitionId: competition.id
        }, 'ORPHANED_DATA_RECOVERY');
        return;
      }

      // Calcular prêmios dinamicamente para as participações
      const participantsData = participations.map(p => ({
        user_id: p.user_id,
        user_score: p.user_score || 0
      }));

      const participantsWithPrizes = await dynamicPrizeService.calculateDynamicPrizes(participantsData);

      // Mapear dados para o histórico
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

      // Salvar no histórico
      await competitionHistoryService.saveCompetitionHistory(historyData);

      // Atualizar prêmios nas participações existentes
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

      logger.info('✅ Dados da competição recuperados com sucesso', {
        competitionId: competition.id,
        title: competition.title,
        participantes: participations.length,
        ganhadores: participantsWithPrizes.filter(p => p.prize > 0).length,
        totalPremios: participantsWithPrizes.reduce((sum, p) => sum + p.prize, 0)
      }, 'ORPHANED_DATA_RECOVERY');

    } catch (error) {
      logger.error('❌ Erro ao recuperar dados da competição', {
        competitionId: competition.id,
        error
      }, 'ORPHANED_DATA_RECOVERY');
    }
  }

  async forceResetUserScores(): Promise<void> {
    try {
      logger.info('🔄 Iniciando reset forçado de pontuações', undefined, 'ORPHANED_DATA_RECOVERY');

      // Buscar todos os usuários que ainda têm pontuação
      const { data: usersWithScore, error: usersError } = await supabase
        .from('profiles')
        .select('id, username, total_score')
        .gt('total_score', 0);

      if (usersError) {
        logger.error('Erro ao buscar usuários com pontuação', { error: usersError }, 'ORPHANED_DATA_RECOVERY');
        return;
      }

      if (!usersWithScore || usersWithScore.length === 0) {
        logger.info('Nenhum usuário com pontuação para resetar', undefined, 'ORPHANED_DATA_RECOVERY');
        return;
      }

      logger.info(`🎯 Resetando pontuações de ${usersWithScore.length} usuários`, {
        usuarios: usersWithScore.map(u => ({ username: u.username, score: u.total_score }))
      }, 'ORPHANED_DATA_RECOVERY');

      // Zerar todas as pontuações
      const { error: resetError } = await supabase
        .from('profiles')
        .update({ total_score: 0 })
        .gt('total_score', 0);

      if (resetError) {
        logger.error('Erro ao resetar pontuações', { error: resetError }, 'ORPHANED_DATA_RECOVERY');
        return;
      }

      logger.info('✅ Pontuações resetadas com sucesso', {
        usuariosAfetados: usersWithScore.length
      }, 'ORPHANED_DATA_RECOVERY');

    } catch (error) {
      logger.error('❌ Erro no reset forçado de pontuações', { error }, 'ORPHANED_DATA_RECOVERY');
    }
  }
}

export const orphanedDataRecoveryService = new OrphanedDataRecoveryService();


import { supabase } from '@/integrations/supabase/client';
import { competitionParticipationService } from './competitionParticipationService';
import { logger } from '@/utils/logger';

export class CompetitionAutoParticipationService {
  async joinCompetitionAutomatically(sessionId: string, activeCompetitions: any[]): Promise<void> {
    try {
      logger.debug('Verificando participação automática em competições', { sessionId }, 'COMPETITION_AUTO_PARTICIPATION_SERVICE');
      
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('user_id, competition_id')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        logger.error('Sessão não encontrada para participação automática', { sessionId, error: sessionError }, 'COMPETITION_AUTO_PARTICIPATION_SERVICE');
        return;
      }

      if (session.competition_id) {
        logger.debug('Sessão já vinculada a competição', { sessionId, competitionId: session.competition_id }, 'COMPETITION_AUTO_PARTICIPATION_SERVICE');
        return;
      }

      if (activeCompetitions.length === 0) {
        logger.debug('Nenhuma competição ativa para participação automática', { sessionId }, 'COMPETITION_AUTO_PARTICIPATION_SERVICE');
        return;
      }

      const activeCompetition = activeCompetitions[0];
      const hasParticipated = await competitionParticipationService.checkUserParticipation(session.user_id, activeCompetition.id);
      
      if (hasParticipated) {
        logger.debug('Usuário já participou desta competição', { 
          sessionId, 
          userId: session.user_id, 
          competitionId: activeCompetition.id 
        }, 'COMPETITION_AUTO_PARTICIPATION_SERVICE');
        return;
      }

      const { error: updateError } = await supabase
        .from('game_sessions')
        .update({ competition_id: activeCompetition.id })
        .eq('id', sessionId);

      if (updateError) {
        logger.error('Erro ao vincular sessão à competição', { sessionId, error: updateError }, 'COMPETITION_AUTO_PARTICIPATION_SERVICE');
        return;
      }

      await competitionParticipationService.createParticipation(activeCompetition.id, session.user_id);
      logger.info('Usuário inscrito automaticamente na competição', { 
        sessionId, 
        userId: session.user_id, 
        competitionId: activeCompetition.id 
      }, 'COMPETITION_AUTO_PARTICIPATION_SERVICE');

    } catch (error) {
      logger.error('Erro na participação automática', { sessionId, error }, 'COMPETITION_AUTO_PARTICIPATION_SERVICE');
    }
  }

  async updateParticipationScore(sessionId: string, totalScore: number): Promise<void> {
    try {
      logger.debug('Atualizando pontuação da participação automática', { sessionId, totalScore }, 'COMPETITION_AUTO_PARTICIPATION_SERVICE');
      
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('user_id, competition_id')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session || !session.competition_id) {
        logger.debug('Sessão não vinculada a competição para atualização', { sessionId }, 'COMPETITION_AUTO_PARTICIPATION_SERVICE');
        return;
      }

      await competitionParticipationService.updateParticipationScore(sessionId, totalScore);
      logger.debug('Pontuação atualizada na participação automática', { sessionId, totalScore }, 'COMPETITION_AUTO_PARTICIPATION_SERVICE');
      
      await competitionParticipationService.updateCompetitionRankings(session.competition_id);
    } catch (error) {
      logger.error('Erro ao atualizar pontuação da participação automática', { sessionId, error }, 'COMPETITION_AUTO_PARTICIPATION_SERVICE');
    }
  }
}

export const competitionAutoParticipationService = new CompetitionAutoParticipationService();

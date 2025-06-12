
import { supabase } from '@/integrations/supabase/client';
import { competitionParticipationService } from './competitionParticipationService';
import { logger } from '@/utils/logger';

export class CompetitionAutoParticipationService {
  async joinCompetitionAutomatically(sessionId: string, activeCompetitions: any[]): Promise<void> {
    try {
      logger.debug('Verificando participação automática em competições diárias', { sessionId });
      
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('user_id, competition_id')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        logger.error('Sessão não encontrada', { sessionId, error: sessionError });
        return;
      }

      if (session.competition_id) {
        logger.debug('Sessão já vinculada a uma competição', { sessionId, competitionId: session.competition_id });
        return;
      }

      if (activeCompetitions.length === 0) {
        logger.debug('Nenhuma competição diária ativa encontrada', { sessionId });
        return;
      }

      const activeCompetition = activeCompetitions[0];
      const hasParticipated = await competitionParticipationService.checkUserParticipation(session.user_id, activeCompetition.id);
      
      if (hasParticipated) {
        logger.debug('Usuário já participou desta competição diária', { 
          sessionId, 
          userId: session.user_id, 
          competitionId: activeCompetition.id 
        });
        return;
      }

      const { error: updateError } = await supabase
        .from('game_sessions')
        .update({ competition_id: activeCompetition.id })
        .eq('id', sessionId);

      if (updateError) {
        logger.error('Erro ao vincular sessão à competição', { sessionId, error: updateError });
        return;
      }

      await competitionParticipationService.createParticipation(activeCompetition.id, session.user_id);
      logger.debug('Usuário inscrito automaticamente na competição diária', { 
        sessionId, 
        userId: session.user_id, 
        competitionId: activeCompetition.id 
      });

    } catch (error) {
      logger.error('Erro na participação automática', { sessionId, error });
    }
  }

  async updateParticipationScore(sessionId: string, totalScore: number): Promise<void> {
    try {
      logger.debug('Atualizando pontuação na competição diária', { sessionId, totalScore });
      
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('user_id, competition_id')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session || !session.competition_id) {
        logger.debug('Sessão não vinculada a competição diária', { sessionId });
        return;
      }

      await competitionParticipationService.updateParticipationScore(sessionId, totalScore);
      logger.debug('Pontuação atualizada na competição diária', { sessionId, totalScore });
      
      await competitionParticipationService.updateCompetitionRankings(session.competition_id);
    } catch (error) {
      logger.error('Erro ao atualizar pontuação da competição', { sessionId, error });
    }
  }
}

export const competitionAutoParticipationService = new CompetitionAutoParticipationService();

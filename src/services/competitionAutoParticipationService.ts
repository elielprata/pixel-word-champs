
import { supabase } from '@/integrations/supabase/client';
import { competitionParticipationService } from './competitionParticipationService';
import { logger } from '@/utils/logger';

export class CompetitionAutoParticipationService {
  async joinCompetitionAutomatically(sessionId: string, activeCompetitions: any[]): Promise<void> {
    try {
      logger.debug('Checking automatic daily competition participation');
      
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('user_id, competition_id')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        logger.error('Session not found', { error: sessionError });
        return;
      }

      if (session.competition_id) {
        logger.debug('Session already linked to a competition');
        return;
      }

      if (activeCompetitions.length === 0) {
        logger.debug('No active daily competitions found');
        return;
      }

      const activeCompetition = activeCompetitions[0];
      const hasParticipated = await competitionParticipationService.checkUserParticipation(session.user_id, activeCompetition.id);
      
      if (hasParticipated) {
        logger.debug('User already participated in this daily competition');
        return;
      }

      const { error: updateError } = await supabase
        .from('game_sessions')
        .update({ competition_id: activeCompetition.id })
        .eq('id', sessionId);

      if (updateError) {
        logger.error('Error linking session to competition', { error: updateError });
        return;
      }

      await competitionParticipationService.createParticipation(activeCompetition.id, session.user_id);
      logger.debug('User automatically enrolled in daily competition');

    } catch (error) {
      logger.error('Error in automatic participation', { error });
    }
  }

  async updateParticipationScore(sessionId: string, totalScore: number): Promise<void> {
    try {
      logger.debug('Updating daily competition score');
      
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('user_id, competition_id')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session || !session.competition_id) {
        logger.debug('Session not linked to daily competition');
        return;
      }

      await competitionParticipationService.updateParticipationScore(sessionId, totalScore);
      logger.debug('Daily competition score updated');
      
      await competitionParticipationService.updateCompetitionRankings(session.competition_id);
    } catch (error) {
      logger.error('Error updating competition score', { error });
    }
  }
}

export const competitionAutoParticipationService = new CompetitionAutoParticipationService();

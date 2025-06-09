
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';

class CompetitionParticipationService {
  async hasUserParticipated(userId: string): Promise<{ success: boolean; hasParticipated: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('id, is_completed')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      const hasParticipated = !!data;
      
      return {
        success: true,
        hasParticipated
      };
    } catch (error) {
      return {
        success: false,
        hasParticipated: false,
        error: handleServiceError(error, 'CHECK_PARTICIPATION')
      };
    }
  }

  async hasUserParticipatedInCompetition(userId: string, competitionId: string): Promise<{ success: boolean; hasParticipated: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('id, is_completed')
        .eq('user_id', userId)
        .eq('competition_id', competitionId)
        .eq('is_completed', true) // Só considera como participação se foi completada
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      const hasParticipated = !!data;
      
      return {
        success: true,
        hasParticipated
      };
    } catch (error) {
      return {
        success: false,
        hasParticipated: false,
        error: handleServiceError(error, 'CHECK_COMPETITION_PARTICIPATION')
      };
    }
  }

  async markUserAsParticipated(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('game_sessions')
        .update({ 
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: handleServiceError(error, 'MARK_PARTICIPATION')
      };
    }
  }

  async checkUserParticipation(userId: string, competitionId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('competition_participations')
        .select('id')
        .eq('user_id', userId)
        .eq('competition_id', competitionId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking user participation:', error);
      return false;
    }
  }

  async createParticipation(userId: string, competitionId: string, score: number = 0): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('competition_participations')
        .insert({
          user_id: userId,
          competition_id: competitionId,
          user_score: score
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: handleServiceError(error, 'CREATE_PARTICIPATION')
      };
    }
  }

  async updateParticipationScore(sessionId: string, totalScore: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('game_sessions')
        .update({ total_score: totalScore })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating participation score:', error);
      throw error;
    }
  }

  async updateCompetitionRankings(competitionId: string): Promise<void> {
    try {
      // Esta função seria implementada para atualizar os rankings da competição
      // Por agora, apenas um placeholder
      console.log(`Updating rankings for competition ${competitionId}`);
    } catch (error) {
      console.error('Error updating competition rankings:', error);
      throw error;
    }
  }
}

export const competitionParticipationService = new CompetitionParticipationService();

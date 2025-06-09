
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
}

export const competitionParticipationService = new CompetitionParticipationService();

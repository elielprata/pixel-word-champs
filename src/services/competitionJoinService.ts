
import { supabase } from '@/integrations/supabase/client';
import { CompetitionParticipation, ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';

export class CompetitionJoinService {
  async joinCompetition(competitionId: string): Promise<ApiResponse<CompetitionParticipation>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('competition_participations')
        .insert({
          competition_id: competitionId,
          user_id: user.id,
          user_score: 0
        })
        .select()
        .single();

      if (error) throw error;

      const participation: CompetitionParticipation = {
        id: data.id,
        competition_id: data.competition_id || '',
        user_id: data.user_id || '',
        user_position: data.user_position || 0,
        user_score: data.user_score || 0,
        prize: data.prize ? Number(data.prize) : undefined,
        payment_status: (data as any).payment_status || 'pending', // Usando type assertion temporariamente
        payment_date: data.payment_date || undefined
      };

      return createSuccessResponse(participation);
    } catch (error) {
      return createErrorResponse(handleServiceError(error, 'COMPETITION_JOIN'));
    }
  }

  async getCompetitionRanking(competitionId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('competition_participations')
        .select(`
          user_position,
          user_score,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('competition_id', competitionId)
        .not('user_position', 'is', null)
        .order('user_position', { ascending: true });

      if (error) throw error;

      return createSuccessResponse(data || []);
    } catch (error) {
      return createErrorResponse(handleServiceError(error, 'COMPETITION_RANKING'));
    }
  }
}

export const competitionJoinService = new CompetitionJoinService();

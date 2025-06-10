
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';

interface CompetitionStats {
  total_participants: number;
  average_score: number;
  highest_score: number;
  competition_duration_hours: number;
}

export class WeeklyStatsService {
  async getCompetitionStats(competitionId: string) {
    try {
      console.log('📈 Calculando estatísticas da competição:', competitionId);

      const { data, error } = await supabase
        .from('competition_participations')
        .select('user_score, created_at')
        .eq('competition_id', competitionId);

      if (error) {
        console.error('❌ Erro ao buscar estatísticas:', error);
        throw error;
      }

      const participants = data || [];
      const scores = participants.map(p => p.user_score || 0);

      const stats: CompetitionStats = {
        total_participants: participants.length,
        average_score: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
        highest_score: scores.length > 0 ? Math.max(...scores) : 0,
        competition_duration_hours: 0
      };

      console.log('✅ Estatísticas calculadas:', stats);
      return createSuccessResponse(stats);

    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      return createErrorResponse(handleServiceError(error, 'STATS_GET'));
    }
  }

  async updateParticipantPosition(competitionId: string) {
    try {
      console.log('🔄 Atualizando posições dos participantes:', competitionId);

      const { data: participants, error } = await supabase
        .from('competition_participations')
        .select('id, user_score')
        .eq('competition_id', competitionId)
        .order('user_score', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar participantes:', error);
        throw error;
      }

      const updates = (participants || []).map((participant, index) => ({
        id: participant.id,
        user_position: index + 1
      }));

      if (updates.length > 0) {
        for (const update of updates) {
          const { error: updateError } = await supabase
            .from('competition_participations')
            .update({ user_position: update.user_position })
            .eq('id', update.id);

          if (updateError) {
            console.error('❌ Erro ao atualizar posição:', updateError);
            throw updateError;
          }
        }
      }

      console.log('✅ Posições atualizadas para', updates.length, 'participantes');
      return createSuccessResponse({ updated: updates.length });

    } catch (error) {
      console.error('❌ Erro ao atualizar posições:', error);
      return createErrorResponse(handleServiceError(error, 'POSITIONS_UPDATE'));
    }
  }
}

export const weeklyStatsService = new WeeklyStatsService();


import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';

interface RankingParticipant {
  user_position: number;
  user_score: number;
  user_id: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  } | null;
}

interface CompetitionStats {
  total_participants: number;
  average_score: number;
  highest_score: number;
  competition_duration_hours: number;
}

class WeeklyCompetitionRankingService {
  async getCompetitionRanking(competitionId: string) {
    try {
      console.log('📊 Buscando ranking da competição:', competitionId);

      // Buscar participações primeiro
      const { data: participations, error: participationsError } = await supabase
        .from('competition_participations')
        .select('user_id, user_score, user_position, created_at')
        .eq('competition_id', competitionId)
        .order('user_position', { ascending: true });

      if (participationsError) {
        console.error('❌ Erro ao buscar participações:', participationsError);
        throw participationsError;
      }

      if (!participations || participations.length === 0) {
        console.log('ℹ️ Nenhuma participação encontrada');
        return createSuccessResponse([]);
      }

      // Buscar perfis separadamente
      const userIds = participations.map(p => p.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('❌ Erro ao buscar perfis:', profilesError);
        throw profilesError;
      }

      // Combinar dados
      const ranking: RankingParticipant[] = participations.map(participation => {
        const profile = profiles?.find(p => p.id === participation.user_id);
        
        return {
          user_position: participation.user_position || 0,
          user_score: participation.user_score || 0,
          user_id: participation.user_id || '',
          created_at: participation.created_at || '',
          profiles: profile ? {
            username: profile.username || 'Usuário',
            avatar_url: profile.avatar_url
          } : null
        };
      });

      console.log('✅ Ranking carregado:', ranking.length, 'participantes');
      return createSuccessResponse(ranking);

    } catch (error) {
      console.error('❌ Erro no serviço de ranking:', error);
      return createErrorResponse(handleServiceError(error, 'RANKING_GET'));
    }
  }

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
        competition_duration_hours: 0 // Calculado se necessário
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

      // Buscar todos os participantes ordenados por pontuação
      const { data: participants, error } = await supabase
        .from('competition_participations')
        .select('id, user_score')
        .eq('competition_id', competitionId)
        .order('user_score', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar participantes:', error);
        throw error;
      }

      // Atualizar posições
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

  async getTopParticipants(competitionId: string, limit: number = 10) {
    try {
      console.log('🏆 Buscando top participantes:', competitionId);

      // Buscar participações primeiro
      const { data: participations, error: participationsError } = await supabase
        .from('competition_participations')
        .select('user_id, user_score, user_position')
        .eq('competition_id', competitionId)
        .not('user_position', 'is', null)
        .order('user_position', { ascending: true })
        .limit(limit);

      if (participationsError) {
        console.error('❌ Erro ao buscar participações:', participationsError);
        throw participationsError;
      }

      if (!participations || participations.length === 0) {
        console.log('ℹ️ Nenhuma participação encontrada no top');
        return createSuccessResponse([]);
      }

      // Buscar perfis separadamente
      const userIds = participations.map(p => p.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('❌ Erro ao buscar perfis:', profilesError);
        throw profilesError;
      }

      // Combinar dados
      const topParticipants = participations.map(participation => {
        const profile = profiles?.find(p => p.id === participation.user_id);
        
        return {
          user_id: participation.user_id,
          user_score: participation.user_score,
          user_position: participation.user_position,
          profiles: profile ? {
            username: profile.username,
            avatar_url: profile.avatar_url
          } : null
        };
      });

      console.log('✅ Top participantes carregados:', topParticipants.length);
      return createSuccessResponse(topParticipants);

    } catch (error) {
      console.error('❌ Erro ao buscar top participantes:', error);
      return createErrorResponse(handleServiceError(error, 'TOP_PARTICIPANTS_GET'));
    }
  }
}

export const weeklyCompetitionRankingService = new WeeklyCompetitionRankingService();

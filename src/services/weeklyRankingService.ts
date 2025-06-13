
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

export class WeeklyRankingService {
  async getCompetitionRanking(competitionId: string) {
    try {
      console.log('📊 Buscando ranking da competição:', competitionId);

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

      const userIds = participations.map(p => p.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('❌ Erro ao buscar perfis:', profilesError);
        throw profilesError;
      }

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

  async getTopParticipants(competitionId: string, limit: number = 10) {
    try {
      console.log('🏆 Buscando top participantes:', competitionId);

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

      const userIds = participations.map(p => p.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('❌ Erro ao buscar perfis:', profilesError);
        throw profilesError;
      }

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

export const weeklyRankingService = new WeeklyRankingService();


import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';

interface DailyCompetitionParticipation {
  id: string;
  competition_id: string;
  user_id: string;
  user_score: number;
  user_position: number;
  created_at: string;
}

class DailyCompetitionService {
  async getActiveDailyCompetitions(): Promise<ApiResponse<any[]>> {
    try {
      console.log('🔍 Buscando competições diárias ativas...');
      
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'challenge')
        .eq('status', 'active')
        .gte('end_date', `${todayStr}T00:00:00`)
        .lte('start_date', `${todayStr}T23:59:59`);

      if (error) throw error;

      console.log('✅ Competições diárias ativas encontradas:', data?.length || 0);
      return createSuccessResponse(data || []);
    } catch (error) {
      console.error('❌ Erro ao buscar competições diárias ativas:', error);
      return createErrorResponse(handleServiceError(error, 'GET_ACTIVE_DAILY_COMPETITIONS'));
    }
  }

  async joinCompetitionAutomatically(sessionId: string): Promise<void> {
    try {
      console.log('🎯 Verificando participação automática em competições diárias...');
      
      // Buscar a sessão de jogo
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('user_id, competition_id')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        console.log('❌ Sessão não encontrada:', sessionError);
        return;
      }

      // Se já tem competition_id, não fazer nada
      if (session.competition_id) {
        console.log('✅ Sessão já vinculada a uma competição');
        return;
      }

      // Buscar competição diária ativa
      const activeCompetitionsResponse = await this.getActiveDailyCompetitions();
      if (!activeCompetitionsResponse.success || activeCompetitionsResponse.data.length === 0) {
        console.log('📅 Nenhuma competição diária ativa encontrada');
        return;
      }

      const activeCompetition = activeCompetitionsResponse.data[0]; // Primeira competição ativa

      // Atualizar a sessão com a competição
      const { error: updateError } = await supabase
        .from('game_sessions')
        .update({ competition_id: activeCompetition.id })
        .eq('id', sessionId);

      if (updateError) {
        console.error('❌ Erro ao vincular sessão à competição:', updateError);
        return;
      }

      // Verificar se o usuário já participa da competição
      const { data: existingParticipation, error: checkError } = await supabase
        .from('competition_participations')
        .select('id')
        .eq('competition_id', activeCompetition.id)
        .eq('user_id', session.user_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar participação:', checkError);
        return;
      }

      // Se não participa ainda, criar participação
      if (!existingParticipation) {
        const { error: participationError } = await supabase
          .from('competition_participations')
          .insert({
            competition_id: activeCompetition.id,
            user_id: session.user_id,
            user_score: 0,
            user_position: null,
            payment_status: 'not_eligible' // Competições diárias não têm premiação
          });

        if (participationError) {
          console.error('❌ Erro ao criar participação:', participationError);
          return;
        }

        console.log('✅ Usuário inscrito automaticamente na competição diária');
      }

    } catch (error) {
      console.error('❌ Erro na participação automática:', error);
    }
  }

  async updateParticipationScore(sessionId: string, totalScore: number): Promise<void> {
    try {
      console.log('📊 Atualizando pontuação na competição diária...');
      
      // Buscar a sessão para obter user_id e competition_id
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('user_id, competition_id')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session || !session.competition_id) {
        console.log('❌ Sessão não vinculada a competição diária');
        return;
      }

      // Atualizar a pontuação na participação
      const { error: updateError } = await supabase
        .from('competition_participations')
        .update({ user_score: totalScore })
        .eq('competition_id', session.competition_id)
        .eq('user_id', session.user_id);

      if (updateError) {
        console.error('❌ Erro ao atualizar pontuação:', updateError);
        return;
      }

      console.log('✅ Pontuação atualizada na competição diária');
      
      // Atualizar rankings
      await this.updateCompetitionRankings(session.competition_id);
    } catch (error) {
      console.error('❌ Erro ao atualizar pontuação da competição:', error);
    }
  }

  async updateCompetitionRankings(competitionId: string): Promise<void> {
    try {
      console.log('🏆 Atualizando rankings da competição diária...');
      
      // Buscar todas as participações ordenadas por pontuação
      const { data: participations, error } = await supabase
        .from('competition_participations')
        .select('id, user_id, user_score')
        .eq('competition_id', competitionId)
        .order('user_score', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar participações:', error);
        return;
      }

      // Atualizar posições
      const updates = participations?.map((participation, index) => ({
        id: participation.id,
        user_position: index + 1
      })) || [];

      for (const update of updates) {
        await supabase
          .from('competition_participations')
          .update({ user_position: update.user_position })
          .eq('id', update.id);
      }

      console.log('✅ Rankings da competição diária atualizados');
    } catch (error) {
      console.error('❌ Erro ao atualizar rankings:', error);
    }
  }

  async getDailyCompetitionRanking(competitionId: string): Promise<ApiResponse<any[]>> {
    try {
      console.log('📊 Buscando ranking da competição diária...');
      
      const { data, error } = await supabase
        .from('competition_participations')
        .select(`
          user_position,
          user_score,
          user_id,
          created_at,
          profiles!inner(username, avatar_url)
        `)
        .eq('competition_id', competitionId)
        .order('user_position', { ascending: true })
        .limit(100);

      if (error) throw error;

      console.log('✅ Ranking da competição diária carregado:', data?.length || 0);
      return createSuccessResponse(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar ranking:', error);
      return createErrorResponse(handleServiceError(error, 'GET_DAILY_COMPETITION_RANKING'));
    }
  }
}

export const dailyCompetitionService = new DailyCompetitionService();

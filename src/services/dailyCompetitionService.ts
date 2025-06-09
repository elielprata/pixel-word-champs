import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { getBrasiliaTime } from '@/utils/brasiliaTime';

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
      console.log('🔍 Buscando competições diárias ativas no banco...');
      
      const brasiliaTime = getBrasiliaTime();
      
      console.log('📅 Data atual de Brasília:', brasiliaTime.toISOString());

      // Buscar competições do tipo 'challenge' que estão ativas
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'challenge')
        .eq('status', 'active');

      console.log('📊 Resposta bruta do banco:', { data, error });

      if (error) {
        console.error('❌ Erro na consulta SQL:', error);
        throw error;
      }

      if (!data) {
        console.log('⚠️ Nenhum dado retornado do banco');
        return createSuccessResponse([]);
      }

      console.log(`📊 Total de competições challenge ativas encontradas: ${data.length}`);
      
      // Log detalhado de cada competição
      data.forEach((comp, index) => {
        console.log(`📋 Competição ${index + 1}:`, {
          id: comp.id,
          title: comp.title,
          type: comp.competition_type,
          status: comp.status,
          start_date: comp.start_date,
          end_date: comp.end_date
        });
      });

      // Filtrar competições que estão dentro do período ativo
      // Usar diretamente as datas UTC do banco para comparação
      const activeCompetitions = data.filter(comp => {
        const startDate = new Date(comp.start_date);
        const endDate = new Date(comp.end_date);
        const now = new Date(); // Usar UTC diretamente
        
        const isActive = now >= startDate && now <= endDate;
        
        console.log(`🔍 Verificando competição "${comp.title}":`, {
          id: comp.id,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          now: now.toISOString(),
          isActive: isActive,
          startTime: startDate.getTime(),
          endTime: endDate.getTime(),
          currentTime: now.getTime()
        });
        
        return isActive;
      });
      
      console.log('✅ Competições ativas após filtro de data:', activeCompetitions.length);
      
      if (activeCompetitions.length > 0) {
        activeCompetitions.forEach((comp, index) => {
          console.log(`🎯 Competição ativa ${index + 1}:`, {
            id: comp.id,
            title: comp.title,
            description: comp.description,
            theme: comp.theme,
            start_date: comp.start_date,
            end_date: comp.end_date,
            max_participants: comp.max_participants
          });
        });
      } else {
        console.log('📅 Nenhuma competição ativa encontrada no período atual');
        
        // Log adicional para debug: mostrar todas as competições e suas datas
        if (data.length > 0) {
          console.log('🔍 Debug - Todas as competições challenge encontradas:');
          data.forEach(comp => {
            const startDate = new Date(comp.start_date);
            const endDate = new Date(comp.end_date);
            const now = new Date();
            
            console.log(`- ${comp.title}:`);
            console.log(`  Início: ${startDate.toISOString()}`);
            console.log(`  Fim: ${endDate.toISOString()}`);
            console.log(`  Agora: ${now.toISOString()}`);
            console.log(`  Timestamps - Start: ${startDate.getTime()}, End: ${endDate.getTime()}, Current: ${now.getTime()}`);
            console.log(`  Começou: ${now >= startDate}, Não terminou: ${now <= endDate}`);
          });
        }
      }
      
      return createSuccessResponse(activeCompetitions);
    } catch (error) {
      console.error('❌ Erro ao buscar competições diárias ativas:', error);
      return createErrorResponse(handleServiceError(error, 'GET_ACTIVE_DAILY_COMPETITIONS'));
    }
  }

  async checkUserParticipation(userId: string, competitionId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('competition_participations')
        .select('id')
        .eq('competition_id', competitionId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar participação:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('❌ Erro ao verificar participação:', error);
      return false;
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

      const activeCompetition = activeCompetitionsResponse.data[0];

      // Verificar se o usuário já participou desta competição
      const hasParticipated = await this.checkUserParticipation(session.user_id, activeCompetition.id);
      if (hasParticipated) {
        console.log('⚠️ Usuário já participou desta competição diária');
        return;
      }

      // Atualizar a sessão com a competição
      const { error: updateError } = await supabase
        .from('game_sessions')
        .update({ competition_id: activeCompetition.id })
        .eq('id', sessionId);

      if (updateError) {
        console.error('❌ Erro ao vincular sessão à competição:', updateError);
        return;
      }

      // Criar participação
      const { error: participationError } = await supabase
        .from('competition_participations')
        .insert({
          competition_id: activeCompetition.id,
          user_id: session.user_id,
          user_score: 0,
          user_position: null,
          payment_status: 'not_eligible'
        });

      if (participationError) {
        console.error('❌ Erro ao criar participação:', participationError);
        return;
      }

      console.log('✅ Usuário inscrito automaticamente na competição diária');

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

  async finalizeDailyCompetition(competitionId: string): Promise<void> {
    try {
      console.log('🏁 Finalizando competição diária e transferindo pontos...');

      // Buscar a competição diária
      const { data: competition, error: compError } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('id', competitionId)
        .single();

      if (compError || !competition) {
        console.error('❌ Competição não encontrada:', compError);
        return;
      }

      // Buscar competição semanal ativa
      const { data: weeklyCompetition, error: weeklyError } = await supabase
        .from('custom_competitions')
        .select('id')
        .eq('competition_type', 'tournament')
        .eq('status', 'active')
        .single();

      if (weeklyError || !weeklyCompetition) {
        console.log('⚠️ Nenhuma competição semanal ativa encontrada para transferir pontos');
      }

      // Buscar todas as participações da competição diária
      const { data: participations, error: partError } = await supabase
        .from('competition_participations')
        .select('user_id, user_score')
        .eq('competition_id', competitionId)
        .gt('user_score', 0);

      if (partError) {
        console.error('❌ Erro ao buscar participações:', partError);
        return;
      }

      // Transferir pontos para a competição semanal se existir
      if (weeklyCompetition && participations && participations.length > 0) {
        for (const participation of participations) {
          // Verificar se o usuário já participa da competição semanal
          const { data: existingWeeklyParticipation, error: checkError } = await supabase
            .from('competition_participations')
            .select('id, user_score')
            .eq('competition_id', weeklyCompetition.id)
            .eq('user_id', participation.user_id)
            .single();

          if (checkError && checkError.code !== 'PGRST116') {
            console.error('❌ Erro ao verificar participação semanal:', checkError);
            continue;
          }

          if (existingWeeklyParticipation) {
            // Somar pontos à participação existente
            const newScore = existingWeeklyParticipation.user_score + participation.user_score;
            await supabase
              .from('competition_participations')
              .update({ user_score: newScore })
              .eq('id', existingWeeklyParticipation.id);
          } else {
            // Criar nova participação na competição semanal
            await supabase
              .from('competition_participations')
              .insert({
                competition_id: weeklyCompetition.id,
                user_id: participation.user_id,
                user_score: participation.user_score,
                user_position: null,
                payment_status: 'pending'
              });
          }

          console.log(`✅ Pontos transferidos para usuário ${participation.user_id}: ${participation.user_score} pontos`);
        }

        // Atualizar rankings da competição semanal
        await this.updateCompetitionRankings(weeklyCompetition.id);
      }

      // Zerar pontos da competição diária
      await supabase
        .from('competition_participations')
        .update({ user_score: 0 })
        .eq('competition_id', competitionId);

      // Marcar competição como finalizada
      await supabase
        .from('custom_competitions')
        .update({ status: 'completed' })
        .eq('id', competitionId);

      console.log('✅ Competição diária finalizada e pontos transferidos');
    } catch (error) {
      console.error('❌ Erro ao finalizar competição diária:', error);
    }
  }

  async getDailyCompetitionRanking(competitionId: string): Promise<ApiResponse<any[]>> {
    try {
      console.log('📊 Buscando ranking da competição diária:', competitionId);
      
      if (!competitionId) {
        console.error('❌ ID da competição não fornecido');
        return createErrorResponse('ID da competição é obrigatório');
      }

      // Primeira consulta: buscar participações
      const { data: participations, error: participationsError } = await supabase
        .from('competition_participations')
        .select('user_position, user_score, user_id, created_at')
        .eq('competition_id', competitionId)
        .not('user_position', 'is', null)
        .order('user_position', { ascending: true })
        .limit(100);

      if (participationsError) {
        console.error('❌ Erro ao buscar participações:', participationsError);
        throw participationsError;
      }

      if (!participations || participations.length === 0) {
        console.log('📊 Nenhuma participação encontrada para a competição');
        return createSuccessResponse([]);
      }

      // Segunda consulta: buscar perfis dos usuários
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
      const rankingData = participations.map(participation => {
        const profile = profiles?.find(p => p.id === participation.user_id);
        return {
          ...participation,
          profiles: profile ? {
            username: profile.username,
            avatar_url: profile.avatar_url
          } : null
        };
      });

      console.log('✅ Ranking da competição diária carregado:', rankingData.length);
      return createSuccessResponse(rankingData);
    } catch (error) {
      console.error('❌ Erro ao carregar ranking:', error);
      return createErrorResponse(handleServiceError(error, 'GET_DAILY_COMPETITION_RANKING'));
    }
  }
}

export const dailyCompetitionService = new DailyCompetitionService();

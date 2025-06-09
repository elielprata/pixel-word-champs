
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { getBrasiliaTime } from '@/utils/brasiliaTime';
import { adjustCompetitionEndTime, isCompetitionActive, logCompetitionVerification } from '@/utils/competitionTimeUtils';
import { competitionParticipationService } from './competitionParticipationService';
import { competitionFinalizationService } from './competitionFinalizationService';

class DailyCompetitionService {
  async getActiveDailyCompetitions(): Promise<ApiResponse<any[]>> {
    try {
      console.log('🔍 Buscando competições diárias ativas no banco...');
      
      const brasiliaTime = getBrasiliaTime();
      console.log('📅 Data atual de Brasília:', brasiliaTime.toISOString());

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

      await this.adjustCompetitionTimes(data);
      const activeCompetitions = this.filterActiveCompetitions(data);
      
      return createSuccessResponse(activeCompetitions);
    } catch (error) {
      console.error('❌ Erro ao buscar competições diárias ativas:', error);
      return createErrorResponse(handleServiceError(error, 'GET_ACTIVE_DAILY_COMPETITIONS'));
    }
  }

  private async adjustCompetitionTimes(competitions: any[]): Promise<void> {
    for (const comp of competitions) {
      const endDate = new Date(comp.end_date);
      const startDate = new Date(comp.start_date);
      
      if (endDate.getUTCHours() !== 23 || endDate.getUTCMinutes() !== 59 || endDate.getUTCSeconds() !== 59) {
        console.log(`🔧 Ajustando horário de fim da competição "${comp.title}" para 23:59:59`);
        
        const correctedEndDate = adjustCompetitionEndTime(startDate);
        
        const { error: updateError } = await supabase
          .from('custom_competitions')
          .update({ 
            end_date: correctedEndDate.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', comp.id);
        
        if (updateError) {
          console.error('❌ Erro ao atualizar competição:', updateError);
        } else {
          console.log('✅ Competição atualizada com sucesso');
          comp.end_date = correctedEndDate.toISOString();
        }
      }
    }
  }

  private filterActiveCompetitions(competitions: any[]): any[] {
    const activeCompetitions = competitions.filter(comp => {
      const startDate = new Date(comp.start_date);
      const endDate = new Date(comp.end_date);
      const now = new Date();
      
      const active = isCompetitionActive(startDate, endDate);
      logCompetitionVerification(comp, active, now);
      
      return active;
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
      this.logDebugInfo(competitions);
    }
    
    return activeCompetitions;
  }

  private logDebugInfo(competitions: any[]): void {
    console.log('📅 Nenhuma competição ativa encontrada no período atual');
    
    if (competitions.length > 0) {
      console.log('🔍 Debug - Todas as competições challenge encontradas:');
      competitions.forEach(comp => {
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

  async joinCompetitionAutomatically(sessionId: string): Promise<void> {
    try {
      console.log('🎯 Verificando participação automática em competições diárias...');
      
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('user_id, competition_id')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        console.log('❌ Sessão não encontrada:', sessionError);
        return;
      }

      if (session.competition_id) {
        console.log('✅ Sessão já vinculada a uma competição');
        return;
      }

      const activeCompetitionsResponse = await this.getActiveDailyCompetitions();
      if (!activeCompetitionsResponse.success || activeCompetitionsResponse.data.length === 0) {
        console.log('📅 Nenhuma competição diária ativa encontrada');
        return;
      }

      const activeCompetition = activeCompetitionsResponse.data[0];
      const hasParticipated = await competitionParticipationService.checkUserParticipation(session.user_id, activeCompetition.id);
      
      if (hasParticipated) {
        console.log('⚠️ Usuário já participou desta competição diária');
        return;
      }

      const { error: updateError } = await supabase
        .from('game_sessions')
        .update({ competition_id: activeCompetition.id })
        .eq('id', sessionId);

      if (updateError) {
        console.error('❌ Erro ao vincular sessão à competição:', updateError);
        return;
      }

      await competitionParticipationService.createParticipation(activeCompetition.id, session.user_id);
      console.log('✅ Usuário inscrito automaticamente na competição diária');

    } catch (error) {
      console.error('❌ Erro na participação automática:', error);
    }
  }

  async updateParticipationScore(sessionId: string, totalScore: number): Promise<void> {
    try {
      console.log('📊 Atualizando pontuação na competição diária...');
      
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('user_id, competition_id')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session || !session.competition_id) {
        console.log('❌ Sessão não vinculada a competição diária');
        return;
      }

      await competitionParticipationService.updateParticipationScore(session.competition_id, session.user_id, totalScore);
      console.log('✅ Pontuação atualizada na competição diária');
      
      await competitionParticipationService.updateCompetitionRankings(session.competition_id);
    } catch (error) {
      console.error('❌ Erro ao atualizar pontuação da competição:', error);
    }
  }

  async getDailyCompetitionRanking(competitionId: string): Promise<ApiResponse<any[]>> {
    try {
      console.log('📊 Buscando ranking da competição diária:', competitionId);
      
      if (!competitionId) {
        console.error('❌ ID da competição não fornecido');
        return createErrorResponse('ID da competição é obrigatório');
      }

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

      const userIds = participations.map(p => p.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('❌ Erro ao buscar perfis:', profilesError);
        throw profilesError;
      }

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

  // Delegação para o serviço de finalização
  async finalizeDailyCompetition(competitionId: string): Promise<void> {
    return competitionFinalizationService.finalizeDailyCompetition(competitionId);
  }

  // Delegação para o serviço de participação
  async checkUserParticipation(userId: string, competitionId: string): Promise<boolean> {
    return competitionParticipationService.checkUserParticipation(userId, competitionId);
  }

  async updateCompetitionRankings(competitionId: string): Promise<void> {
    return competitionParticipationService.updateCompetitionRankings(competitionId);
  }
}

export const dailyCompetitionService = new DailyCompetitionService();

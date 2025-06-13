import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

export interface DailyCompetition {
  id: string;
  title: string;
  description?: string;
  theme?: string;
  start_date: string;
  end_date: string;
  competition_type: 'tournament' | 'challenge';
  status: 'scheduled' | 'active' | 'completed';
  max_participants?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DailyRankingEntry {
  position: number;
  username: string;
  score: number;
  avatar_url: string | null;
}

class DailyCompetitionService {
  async getTodayCompetition(): Promise<ApiResponse<DailyCompetition | null>> {
    try {
      logger.debug('Buscando competição do dia', undefined, 'DAILY_COMPETITION_SERVICE');

      const today = new Date().toISOString().split('T')[0];

      const { data: competition, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'challenge')
        .eq('status', 'active')
        .gte('start_date', today)
        .lt('end_date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.debug('Nenhuma competição diária ativa encontrada para hoje', undefined, 'DAILY_COMPETITION_SERVICE');
          return createSuccessResponse(null);
        }
        logger.error('Erro ao buscar competição diária no banco de dados', { error }, 'DAILY_COMPETITION_SERVICE');
        throw error;
      }

      logger.debug('Competição diária encontrada', { 
        competitionId: competition.id,
        title: competition.title 
      }, 'DAILY_COMPETITION_SERVICE');

      return createSuccessResponse(competition);
    } catch (error) {
      logger.error('Erro crítico ao buscar competição diária', { error }, 'DAILY_COMPETITION_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GET_TODAY_COMPETITION'));
    }
  }

  async joinTodayCompetition(): Promise<ApiResponse<boolean>> {
    try {
      logger.info('Tentativa de participar da competição diária', undefined, 'DAILY_COMPETITION_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de participar sem usuário autenticado', undefined, 'DAILY_COMPETITION_SERVICE');
        return createErrorResponse('Usuário não autenticado');
      }

      const todayCompetition = await this.getTodayCompetition();
      
      if (!todayCompetition.success || !todayCompetition.data) {
        logger.warn('Nenhuma competição diária disponível para participar', undefined, 'DAILY_COMPETITION_SERVICE');
        return createErrorResponse('Nenhuma competição diária ativa disponível');
      }

      const competitionId = todayCompetition.data.id;

      // Verificar se já está participando
      const { data: existingParticipation, error: checkError } = await supabase
        .from('competition_participations')
        .select('id')
        .eq('competition_id', competitionId)
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        logger.error('Erro ao verificar participação existente', { 
          competitionId, 
          userId: user.id, 
          error: checkError 
        }, 'DAILY_COMPETITION_SERVICE');
        throw checkError;
      }

      if (existingParticipation) {
        logger.info('Usuário já está participando da competição diária', { 
          competitionId, 
          userId: user.id 
        }, 'DAILY_COMPETITION_SERVICE');
        return createSuccessResponse(true);
      }

      // Criar nova participação
      const { error: insertError } = await supabase
        .from('competition_participations')
        .insert({
          competition_id: competitionId,
          user_id: user.id,
          user_score: 0,
          joined_at: new Date().toISOString()
        });

      if (insertError) {
        logger.error('Erro ao criar participação na competição diária', { 
          competitionId, 
          userId: user.id, 
          error: insertError 
        }, 'DAILY_COMPETITION_SERVICE');
        throw insertError;
      }

      logger.info('Participação na competição diária criada com sucesso', { 
        competitionId, 
        userId: user.id 
      }, 'DAILY_COMPETITION_SERVICE');

      return createSuccessResponse(true);
    } catch (error) {
      logger.error('Erro crítico ao participar da competição diária', { error }, 'DAILY_COMPETITION_SERVICE');
      return createErrorResponse(handleServiceError(error, 'JOIN_TODAY_COMPETITION'));
    }
  }

  async getDailyRanking(): Promise<ApiResponse<DailyRankingEntry[]>> {
    try {
      logger.debug('Buscando ranking da competição diária', undefined, 'DAILY_COMPETITION_SERVICE');

      const todayCompetition = await this.getTodayCompetition();
      
      if (!todayCompetition.success || !todayCompetition.data) {
        logger.debug('Nenhuma competição diária para ranking', undefined, 'DAILY_COMPETITION_SERVICE');
        return createSuccessResponse([]);
      }

      const { data: rankings, error } = await supabase
        .from('competition_participations')
        .select(`
          user_score,
          joined_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('competition_id', todayCompetition.data.id)
        .order('user_score', { ascending: false })
        .limit(100);

      if (error) {
        logger.error('Erro ao buscar ranking diário no banco de dados', { error }, 'DAILY_COMPETITION_SERVICE');
        throw error;
      }

      const rankingEntries: DailyRankingEntry[] = (rankings || []).map((entry, index) => ({
        position: index + 1,
        username: entry.profiles?.username || 'Usuário',
        score: entry.user_score,
        avatar_url: entry.profiles?.avatar_url || null
      }));

      logger.debug('Ranking diário carregado', { 
        entriesCount: rankingEntries.length 
      }, 'DAILY_COMPETITION_SERVICE');

      return createSuccessResponse(rankingEntries);
    } catch (error) {
      logger.error('Erro crítico ao buscar ranking diário', { error }, 'DAILY_COMPETITION_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GET_DAILY_RANKING'));
    }
  }

  async updateUserScore(score: number): Promise<ApiResponse<boolean>> {
    try {
      logger.info('Atualizando pontuação na competição diária', { score }, 'DAILY_COMPETITION_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de atualizar pontuação sem usuário autenticado', undefined, 'DAILY_COMPETITION_SERVICE');
        return createErrorResponse('Usuário não autenticado');
      }

      const todayCompetition = await this.getTodayCompetition();
      
      if (!todayCompetition.success || !todayCompetition.data) {
        logger.warn('Nenhuma competição diária para atualizar pontuação', undefined, 'DAILY_COMPETITION_SERVICE');
        return createErrorResponse('Nenhuma competição diária ativa');
      }

      const { error } = await supabase
        .from('competition_participations')
        .update({ 
          user_score: score,
          updated_at: new Date().toISOString()
        })
        .eq('competition_id', todayCompetition.data.id)
        .eq('user_id', user.id);

      if (error) {
        logger.error('Erro ao atualizar pontuação diária no banco de dados', { 
          score, 
          userId: user.id, 
          error 
        }, 'DAILY_COMPETITION_SERVICE');
        throw error;
      }

      logger.info('Pontuação diária atualizada com sucesso', { 
        score, 
        userId: user.id 
      }, 'DAILY_COMPETITION_SERVICE');

      return createSuccessResponse(true);
    } catch (error) {
      logger.error('Erro crítico ao atualizar pontuação diária', { 
        score, 
        error 
      }, 'DAILY_COMPETITION_SERVICE');
      return createErrorResponse(handleServiceError(error, 'UPDATE_USER_SCORE'));
    }
  }
}

export const dailyCompetitionService = new DailyCompetitionService();

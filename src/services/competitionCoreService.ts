
import { supabase } from '@/integrations/supabase/client';
import { Competition, ApiResponse } from '@/types';
import { logger } from '@/utils/logger';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';

class CompetitionCoreService {
  async getActiveCompetitions(): Promise<ApiResponse<Competition[]>> {
    try {
      logger.debug('Buscando competições ativas', undefined, 'COMPETITION_CORE_SERVICE');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('status', 'active')
        .order('start_date', { ascending: true });

      if (error) {
        logger.error('Erro ao carregar competições ativas', { error: error.message }, 'COMPETITION_CORE_SERVICE');
        throw new Error(error.message);
      }

      const mappedCompetitions: Competition[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        theme: item.theme || '',
        start_date: item.start_date,
        end_date: item.end_date,
        status: item.status as 'pending' | 'active' | 'completed' | 'scheduled',
        type: item.competition_type === 'challenge' ? 'daily' : item.competition_type === 'tournament' ? 'weekly' : 'challenge',
        competition_type: item.competition_type || 'challenge',
        prize_pool: item.prize_pool || 0,
        total_participants: 0,
        max_participants: item.max_participants || 1000,
        created_at: item.created_at || '',
        updated_at: item.updated_at || ''
      }));

      logger.info('Competições ativas carregadas', { count: mappedCompetitions.length }, 'COMPETITION_CORE_SERVICE');
      return createSuccessResponse(mappedCompetitions);
    } catch (error) {
      logger.error('Erro ao carregar competições ativas', { error }, 'COMPETITION_CORE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GET_ACTIVE_COMPETITIONS'));
    }
  }

  async getDailyCompetition(): Promise<ApiResponse<Competition | null>> {
    try {
      logger.debug('Buscando competição diária ativa', undefined, 'COMPETITION_CORE_SERVICE');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'challenge')
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Erro ao carregar competição diária', { error: error.message }, 'COMPETITION_CORE_SERVICE');
        throw new Error(error.message);
      }

      if (!data) {
        logger.info('Nenhuma competição diária ativa encontrada', undefined, 'COMPETITION_CORE_SERVICE');
        return createSuccessResponse(null);
      }

      const mappedDaily: Competition = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        theme: data.theme || '',
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status as 'pending' | 'active' | 'completed' | 'scheduled',
        type: 'daily',
        competition_type: data.competition_type || 'challenge',
        prize_pool: data.prize_pool || 0,
        total_participants: 0,
        max_participants: data.max_participants || 1000,
        created_at: data.created_at || '',
        updated_at: data.updated_at || ''
      };

      logger.info('Competição diária encontrada', { id: data.id, title: data.title }, 'COMPETITION_CORE_SERVICE');
      return createSuccessResponse(mappedDaily);
    } catch (error) {
      logger.error('Erro ao carregar competição diária', { error }, 'COMPETITION_CORE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GET_DAILY_COMPETITION'));
    }
  }

  async getWeeklyCompetition(): Promise<ApiResponse<Competition | null>> {
    try {
      logger.debug('Buscando competição semanal ativa', undefined, 'COMPETITION_CORE_SERVICE');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'tournament')
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Erro ao carregar competição semanal', { error: error.message }, 'COMPETITION_CORE_SERVICE');
        throw new Error(error.message);
      }

      if (!data) {
        logger.info('Nenhuma competição semanal ativa encontrada', undefined, 'COMPETITION_CORE_SERVICE');
        return createSuccessResponse(null);
      }

      const mappedWeekly: Competition = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        theme: data.theme || '',
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status as 'pending' | 'active' | 'completed' | 'scheduled',
        type: 'weekly',
        competition_type: data.competition_type || 'tournament',
        prize_pool: data.prize_pool || 0,
        total_participants: 0,
        max_participants: data.max_participants || 1000,
        created_at: data.created_at || '',
        updated_at: data.updated_at || ''
      };

      logger.info('Competição semanal encontrada', { id: data.id, title: data.title }, 'COMPETITION_CORE_SERVICE');
      return createSuccessResponse(mappedWeekly);
    } catch (error) {
      logger.error('Erro ao carregar competição semanal', { error }, 'COMPETITION_CORE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GET_WEEKLY_COMPETITION'));
    }
  }
}

export const competitionCoreService = new CompetitionCoreService();

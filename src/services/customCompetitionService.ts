
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

export interface CustomCompetitionData {
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  category?: string;
  weeklyTournamentId?: string;
  prizePool: number;
  maxParticipants: number;
  startDate?: string;
  endDate?: string;
}

class CustomCompetitionService {
  async createCompetition(competitionData: CreateCompetitionData): Promise<ApiResponse<CustomCompetition>> {
    try {
      logger.info('Criando nova competição personalizada', { 
        title: competitionData.title,
        type: competitionData.competition_type,
        hasStartDate: !!competitionData.start_date,
        hasEndDate: !!competitionData.end_date 
      }, 'CUSTOM_COMPETITION_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de criar competição sem usuário autenticado', undefined, 'CUSTOM_COMPETITION_SERVICE');
        return createErrorResponse('Usuário não autenticado');
      }

      const { data: competition, error } = await supabase
        .from('custom_competitions')
        .insert({
          ...competitionData,
          created_by: user.id,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar competição no banco de dados', { error }, 'CUSTOM_COMPETITION_SERVICE');
        throw error;
      }

      logger.info('Competição personalizada criada com sucesso', { 
        competitionId: competition.id,
        title: competition.title 
      }, 'CUSTOM_COMPETITION_SERVICE');

      return createSuccessResponse(competition);
    } catch (error) {
      logger.error('Erro crítico ao criar competição personalizada', { error }, 'CUSTOM_COMPETITION_SERVICE');
      return createErrorResponse(handleServiceError(error, 'CREATE_CUSTOM_COMPETITION'));
    }
  }

  async updateCompetition(id: string, updates: Partial<CreateCompetitionData>): Promise<ApiResponse<CustomCompetition>> {
    try {
      logger.info('Atualizando competição personalizada', { 
        competitionId: id,
        updates 
      }, 'CUSTOM_COMPETITION_SERVICE');

      const { data: competition, error } = await supabase
        .from('custom_competitions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao atualizar competição no banco de dados', { 
          competitionId: id, 
          error 
        }, 'CUSTOM_COMPETITION_SERVICE');
        throw error;
      }

      logger.info('Competição personalizada atualizada com sucesso', { 
        competitionId: id,
        title: competition.title 
      }, 'CUSTOM_COMPETITION_SERVICE');

      return createSuccessResponse(competition);
    } catch (error) {
      logger.error('Erro crítico ao atualizar competição personalizada', { 
        competitionId: id, 
        error 
      }, 'CUSTOM_COMPETITION_SERVICE');
      return createErrorResponse(handleServiceError(error, 'UPDATE_CUSTOM_COMPETITION'));
    }
  }

  async deleteCompetition(id: string): Promise<ApiResponse<boolean>> {
    try {
      logger.info('Removendo competição personalizada', { competitionId: id }, 'CUSTOM_COMPETITION_SERVICE');

      const { error } = await supabase
        .from('custom_competitions')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Erro ao remover competição no banco de dados', { 
          competitionId: id, 
          error 
        }, 'CUSTOM_COMPETITION_SERVICE');
        throw error;
      }

      logger.info('Competição personalizada removida com sucesso', { 
        competitionId: id 
      }, 'CUSTOM_COMPETITION_SERVICE');

      return createSuccessResponse(true);
    } catch (error) {
      logger.error('Erro crítico ao remover competição personalizada', { 
        competitionId: id, 
        error 
      }, 'CUSTOM_COMPETITION_SERVICE');
      return createErrorResponse(handleServiceError(error, 'DELETE_CUSTOM_COMPETITION'));
    }
  }

  async getCompetitions(filters?: CompetitionFilters): Promise<ApiResponse<CustomCompetition[]>> {
    try {
      logger.debug('Buscando competições personalizadas', { filters }, 'CUSTOM_COMPETITION_SERVICE');

      let query = supabase.from('custom_competitions').select('*');

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.competition_type) {
        query = query.eq('competition_type', filters.competition_type);
      }

      if (filters?.created_by) {
        query = query.eq('created_by', filters.created_by);
      }

      const { data: competitions, error } = await query.order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar competições no banco de dados', { 
          filters, 
          error 
        }, 'CUSTOM_COMPETITION_SERVICE');
        throw error;
      }

      logger.debug('Competições personalizadas carregadas', { 
        count: competitions?.length || 0,
        filters 
      }, 'CUSTOM_COMPETITION_SERVICE');

      return createSuccessResponse(competitions || []);
    } catch (error) {
      logger.error('Erro crítico ao buscar competições personalizadas', { 
        filters, 
        error 
      }, 'CUSTOM_COMPETITION_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GET_CUSTOM_COMPETITIONS'));
    }
  }

  async getCompetitionById(id: string): Promise<ApiResponse<CustomCompetition | null>> {
    try {
      logger.debug('Buscando competição personalizada por ID', { competitionId: id }, 'CUSTOM_COMPETITION_SERVICE');

      const { data: competition, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.warn('Competição personalizada não encontrada', { competitionId: id }, 'CUSTOM_COMPETITION_SERVICE');
          return createSuccessResponse(null);
        }
        logger.error('Erro ao buscar competição no banco de dados', { 
          competitionId: id, 
          error 
        }, 'CUSTOM_COMPETITION_SERVICE');
        throw error;
      }

      logger.debug('Competição personalizada encontrada', { 
        competitionId: id,
        title: competition.title 
      }, 'CUSTOM_COMPETITION_SERVICE');

      return createSuccessResponse(competition);
    } catch (error) {
      logger.error('Erro crítico ao buscar competição personalizada', { 
        competitionId: id, 
        error 
      }, 'CUSTOM_COMPETITION_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GET_CUSTOM_COMPETITION_BY_ID'));
    }
  }
}

export const customCompetitionService = new CustomCompetitionService();

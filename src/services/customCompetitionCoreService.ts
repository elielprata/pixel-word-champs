import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { createBrasiliaTimestamp } from '@/utils/brasiliaTimeUnified';
import { logger } from '@/utils/logger';

export class CustomCompetitionCoreService {
  /**
   * Cria uma nova competição customizada (nome padronizado)
   */
  async createCompetition(competitionData: any): Promise<ApiResponse<any>> {
    try {
      logger.info('Criando competição customizada (BRASÍLIA)', { 
        type: competitionData.competition_type,
        title: competitionData.title 
      }, 'CUSTOM_COMPETITION_CORE_SERVICE');

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Usuário não autenticado');
      }

      // Preparar datas em Brasília
      const startDateBrasilia = createBrasiliaTimestamp(competitionData.startDate);
      const endDateBrasilia = createBrasiliaTimestamp(competitionData.endDate, true);

      const dataToInsert = {
        ...competitionData,
        start_date: startDateBrasilia,
        end_date: endDateBrasilia,
        created_by: user.user.id,
        status: 'active'
      };

      delete dataToInsert.startDate;
      delete dataToInsert.endDate;

      logger.debug('Dados preparados para inserção (BRASÍLIA)', { dataToInsert }, 'CUSTOM_COMPETITION_CORE_SERVICE');

      const { data, error } = await supabase
        .from('custom_competitions')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) throw error;

      logger.info('Competição criada com sucesso (BRASÍLIA)', { 
        id: data.id,
        title: data.title 
      }, 'CUSTOM_COMPETITION_CORE_SERVICE');

      return createSuccessResponse(data);
    } catch (error) {
      logger.error('Erro ao criar competição', { error }, 'CUSTOM_COMPETITION_CORE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'CREATE_CUSTOM_COMPETITION'));
    }
  }

  /**
   * Método legado - mantido para compatibilidade
   */
  async createCustomCompetition(competitionData: any): Promise<ApiResponse<any>> {
    return this.createCompetition(competitionData);
  }

  /**
   * Busca competições ativas
   */
  async getActiveCompetitions(): Promise<ApiResponse<any[]>> {
    try {
      logger.debug('Buscando competições ativas', undefined, 'CUSTOM_COMPETITION_CORE_SERVICE');

      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      logger.debug('Competições ativas carregadas', { 
        count: data?.length || 0 
      }, 'CUSTOM_COMPETITION_CORE_SERVICE');

      return createSuccessResponse(data || []);
    } catch (error) {
      logger.error('Erro ao buscar competições ativas', { error }, 'CUSTOM_COMPETITION_CORE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GET_ACTIVE_COMPETITIONS'));
    }
  }

  /**
   * Atualiza uma competição existente
   */
  async updateCustomCompetition(id: string, updateData: any): Promise<ApiResponse<any>> {
    try {
      logger.info('Atualizando competição customizada (BRASÍLIA)', { id }, 'CUSTOM_COMPETITION_CORE_SERVICE');

      // Preparar datas se fornecidas
      if (updateData.startDate) {
        updateData.start_date = createBrasiliaTimestamp(updateData.startDate);
        delete updateData.startDate;
      }
      
      if (updateData.endDate) {
        updateData.end_date = createBrasiliaTimestamp(updateData.endDate, true);
        delete updateData.endDate;
      }

      const { data, error } = await supabase
        .from('custom_competitions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      logger.info('Competição atualizada com sucesso (BRASÍLIA)', { 
        id: data.id 
      }, 'CUSTOM_COMPETITION_CORE_SERVICE');

      return createSuccessResponse(data);
    } catch (error) {
      logger.error('Erro ao atualizar competição', { id, error }, 'CUSTOM_COMPETITION_CORE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'UPDATE_CUSTOM_COMPETITION'));
    }
  }

  /**
   * Remove uma competição
   */
  async deleteCustomCompetition(id: string): Promise<ApiResponse<boolean>> {
    try {
      logger.info('Removendo competição customizada', { id }, 'CUSTOM_COMPETITION_CORE_SERVICE');

      const { error } = await supabase
        .from('custom_competitions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      logger.info('Competição removida com sucesso', { id }, 'CUSTOM_COMPETITION_CORE_SERVICE');
      return createSuccessResponse(true);
    } catch (error) {
      logger.error('Erro ao remover competição', { id, error }, 'CUSTOM_COMPETITION_CORE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'DELETE_CUSTOM_COMPETITION'));
    }
  }

  /**
   * Busca competições customizadas (todas)
   */
  async getCustomCompetitions(): Promise<ApiResponse<any[]>> {
    try {
      logger.debug('Buscando competições customizadas', undefined, 'CUSTOM_COMPETITION_CORE_SERVICE');

      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      logger.debug('Competições carregadas', { 
        count: data?.length || 0 
      }, 'CUSTOM_COMPETITION_CORE_SERVICE');

      return createSuccessResponse(data || []);
    } catch (error) {
      logger.error('Erro ao buscar competições', { error }, 'CUSTOM_COMPETITION_CORE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GET_CUSTOM_COMPETITIONS'));
    }
  }
}

export const customCompetitionCoreService = new CustomCompetitionCoreService();

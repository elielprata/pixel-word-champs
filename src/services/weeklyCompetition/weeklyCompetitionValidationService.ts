import { supabase } from '@/integrations/supabase/client';
import { validateWeeklyCompetitionData } from '@/utils/weeklyCompetitionValidation';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { ApiResponse } from '@/types';
import { logger } from '@/utils/logger';
import { competitionStatusService } from '@/services/competitionStatusService';

export class WeeklyCompetitionValidationService {
  /**
   * Cria competição semanal com validação obrigatória de horário
   */
  async createWeeklyCompetition(formData: any): Promise<ApiResponse<any>> {
    try {
      logger.info('Criando competição semanal com validação', { title: formData.title }, 'WEEKLY_COMPETITION_VALIDATION_SERVICE');
      
      // OBRIGATÓRIO: Validar e corrigir dados antes de salvar
      const validatedData = validateWeeklyCompetitionData(formData);
      
      logger.debug('Dados validados e corrigidos para competição semanal', { validatedData }, 'WEEKLY_COMPETITION_VALIDATION_SERVICE');
      
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      // Inserir no banco - o trigger garantirá horários padronizados
      const { data, error } = await supabase
        .from('custom_competitions')
        .insert({
          title: validatedData.title,
          description: validatedData.description,
          start_date: validatedData.start_date,
          end_date: validatedData.end_date,
          competition_type: validatedData.competition_type,
          prize_pool: validatedData.prize_pool,
          max_participants: validatedData.max_participants,
          created_by: user?.id,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar competição semanal', { error }, 'WEEKLY_COMPETITION_VALIDATION_SERVICE');
        throw error;
      }

      logger.info('Competição semanal criada com sucesso', { competitionId: data.id }, 'WEEKLY_COMPETITION_VALIDATION_SERVICE');
      return createSuccessResponse(data);
    } catch (error) {
      logger.error('Erro na criação de competição semanal', { error }, 'WEEKLY_COMPETITION_VALIDATION_SERVICE');
      return createErrorResponse(handleServiceError(error, 'CREATE_WEEKLY_COMPETITION'));
    }
  }

  /**
   * Atualiza competição semanal com validação obrigatória de horário
   */
  async updateWeeklyCompetition(competitionId: string, formData: any): Promise<ApiResponse<any>> {
    try {
      logger.info('Atualizando competição semanal', { competitionId, title: formData.title }, 'WEEKLY_COMPETITION_VALIDATION_SERVICE');
      
      // OBRIGATÓRIO: Validar e corrigir dados antes de atualizar
      const validatedData = validateWeeklyCompetitionData(formData);
      
      logger.debug('Dados validados para atualização semanal', { competitionId, validatedData }, 'WEEKLY_COMPETITION_VALIDATION_SERVICE');
      
      // Atualizar no banco - o trigger garantirá horários padronizados
      const { data, error } = await supabase
        .from('custom_competitions')
        .update({
          title: validatedData.title,
          description: validatedData.description,
          start_date: validatedData.start_date,
          end_date: validatedData.end_date,
          prize_pool: validatedData.prize_pool,
          max_participants: validatedData.max_participants,
          updated_at: new Date().toISOString()
        })
        .eq('id', competitionId)
        .eq('competition_type', 'tournament') // Garantir que só atualize competições semanais
        .select()
        .single();

      if (error) {
        logger.error('Erro ao atualizar competição semanal', { competitionId, error }, 'WEEKLY_COMPETITION_VALIDATION_SERVICE');
        throw error;
      }

      if (!data) {
        const errorMsg = 'Competição não encontrada ou não é uma competição semanal';
        logger.error(errorMsg, { competitionId }, 'WEEKLY_COMPETITION_VALIDATION_SERVICE');
        throw new Error(errorMsg);
      }

      logger.info('Competição semanal atualizada com sucesso', { competitionId }, 'WEEKLY_COMPETITION_VALIDATION_SERVICE');
      return createSuccessResponse(data);
    } catch (error) {
      logger.error('Erro na atualização de competição semanal', { competitionId, error }, 'WEEKLY_COMPETITION_VALIDATION_SERVICE');
      return createErrorResponse(handleServiceError(error, 'UPDATE_WEEKLY_COMPETITION'));
    }
  }
}

export const weeklyCompetitionValidationService = new WeeklyCompetitionValidationService();

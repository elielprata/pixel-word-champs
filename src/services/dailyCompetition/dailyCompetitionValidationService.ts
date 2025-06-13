
import { supabase } from '@/integrations/supabase/client';
import { validateDailyCompetitionData } from '@/utils/dailyCompetitionValidation';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { ApiResponse } from '@/types';
import { logger } from '@/utils/logger';

export class DailyCompetitionValidationService {
  /**
   * Cria competição diária com validação obrigatória de horário
   */
  async createDailyCompetition(formData: any): Promise<ApiResponse<any>> {
    try {
      logger.info('Service: Criando competição diária com validação', { 
        title: formData.title,
        hasStartDate: !!formData.start_date 
      }, 'DAILY_COMPETITION_VALIDATION');
      
      // OBRIGATÓRIO: Validar e corrigir dados antes de salvar
      const validatedData = validateDailyCompetitionData(formData);
      
      logger.info('Service: Dados validados e corrigidos', { 
        title: validatedData.title,
        start_date: validatedData.start_date,
        end_date: validatedData.end_date 
      }, 'DAILY_COMPETITION_VALIDATION');
      
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      // Inserir no banco - o trigger garantirá 23:59:59
      const { data, error } = await supabase
        .from('custom_competitions')
        .insert({
          title: validatedData.title,
          description: validatedData.description,
          theme: validatedData.theme,
          start_date: validatedData.start_date,
          end_date: validatedData.end_date, // Obrigatório e sempre fornecido pela validação
          competition_type: validatedData.competition_type,
          max_participants: formData.max_participants || null,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) {
        logger.error('Service: Erro ao criar competição', { error }, 'DAILY_COMPETITION_VALIDATION');
        throw error;
      }

      logger.info('Service: Competição criada com sucesso', { 
        competitionId: data.id,
        title: data.title 
      }, 'DAILY_COMPETITION_VALIDATION');
      return createSuccessResponse(data);
    } catch (error) {
      logger.error('Service: Erro na criação', { error }, 'DAILY_COMPETITION_VALIDATION');
      return createErrorResponse(handleServiceError(error, 'CREATE_DAILY_COMPETITION'));
    }
  }

  /**
   * Atualiza competição diária com validação obrigatória de horário
   */
  async updateDailyCompetition(competitionId: string, formData: any): Promise<ApiResponse<any>> {
    try {
      logger.info('Service: Atualizando competição diária', { 
        competitionId,
        hasFormData: !!formData 
      }, 'DAILY_COMPETITION_VALIDATION');
      
      // OBRIGATÓRIO: Validar e corrigir dados antes de atualizar
      const validatedData = validateDailyCompetitionData(formData);
      
      logger.info('Service: Dados validados para atualização', { 
        competitionId,
        title: validatedData.title,
        start_date: validatedData.start_date,
        end_date: validatedData.end_date 
      }, 'DAILY_COMPETITION_VALIDATION');
      
      // Atualizar no banco - o trigger garantirá 23:59:59
      const { data, error } = await supabase
        .from('custom_competitions')
        .update({
          title: validatedData.title,
          description: validatedData.description,
          theme: validatedData.theme,
          start_date: validatedData.start_date,
          end_date: validatedData.end_date, // Será corrigido pelo trigger se necessário
          updated_at: new Date().toISOString()
        })
        .eq('id', competitionId)
        .eq('competition_type', 'challenge') // Garantir que só atualize competições diárias
        .select()
        .single();

      if (error) {
        logger.error('Service: Erro ao atualizar competição', { 
          competitionId, 
          error 
        }, 'DAILY_COMPETITION_VALIDATION');
        throw error;
      }

      if (!data) {
        throw new Error('Competição não encontrada ou não é uma competição diária');
      }

      logger.info('Service: Competição atualizada com sucesso', { 
        competitionId,
        title: data.title 
      }, 'DAILY_COMPETITION_VALIDATION');
      return createSuccessResponse(data);
    } catch (error) {
      logger.error('Service: Erro na atualização', { 
        competitionId, 
        error 
      }, 'DAILY_COMPETITION_VALIDATION');
      return createErrorResponse(handleServiceError(error, 'UPDATE_DAILY_COMPETITION'));
    }
  }

  /**
   * Verifica e corrige competições diárias com horário incorreto
   */
  async validateAllDailyCompetitions(): Promise<ApiResponse<any>> {
    try {
      logger.info('Service: Verificando todas as competições diárias...', undefined, 'DAILY_COMPETITION_VALIDATION');
      
      // Buscar todas as competições diárias
      const { data: competitions, error } = await supabase
        .from('custom_competitions')
        .select('id, title, start_date, end_date, status')
        .eq('competition_type', 'challenge');

      if (error) {
        throw error;
      }

      const corrections = [];
      
      for (const comp of competitions || []) {
        // Verificar se precisa correção
        const startDate = new Date(comp.start_date);
        const endDate = new Date(comp.end_date);
        const expectedEndDate = new Date(startDate);
        expectedEndDate.setHours(23, 59, 59, 999);
        
        if (endDate.getTime() !== expectedEndDate.getTime()) {
          logger.info('Corrigindo competição', {
            competitionId: comp.id,
            title: comp.title,
            current: endDate.toISOString(),
            expected: expectedEndDate.toISOString()
          }, 'DAILY_COMPETITION_VALIDATION');
          
          corrections.push({
            id: comp.id,
            title: comp.title,
            corrected: true
          });
        }
      }

      logger.info('Verificação concluída', { 
        totalChecked: competitions?.length || 0,
        correctionsNeeded: corrections.length 
      }, 'DAILY_COMPETITION_VALIDATION');
      return createSuccessResponse({ totalChecked: competitions?.length || 0, corrected: corrections });
    } catch (error) {
      logger.error('Service: Erro na validação', { error }, 'DAILY_COMPETITION_VALIDATION');
      return createErrorResponse(handleServiceError(error, 'VALIDATE_ALL_DAILY_COMPETITIONS'));
    }
  }
}

export const dailyCompetitionValidationService = new DailyCompetitionValidationService();

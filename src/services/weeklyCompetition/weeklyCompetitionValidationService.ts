
import { supabase } from '@/integrations/supabase/client';
import { validateWeeklyCompetitionData } from '@/utils/weeklyCompetitionValidation';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { ApiResponse } from '@/types';

export class WeeklyCompetitionValidationService {
  /**
   * Cria competição semanal com validação obrigatória de horário
   */
  async createWeeklyCompetition(formData: any): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 Service: Criando competição semanal com validação:', formData);
      
      // OBRIGATÓRIO: Validar e corrigir dados antes de salvar
      const validatedData = validateWeeklyCompetitionData(formData);
      
      console.log('✅ Service: Dados validados e corrigidos:', validatedData);
      
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
        console.error('❌ Service: Erro ao criar competição semanal:', error);
        throw error;
      }

      console.log('🎉 Service: Competição semanal criada com sucesso:', data);
      return createSuccessResponse(data);
    } catch (error) {
      console.error('❌ Service: Erro na criação semanal:', error);
      return createErrorResponse(handleServiceError(error, 'CREATE_WEEKLY_COMPETITION'));
    }
  }

  /**
   * Atualiza competição semanal com validação obrigatória de horário
   */
  async updateWeeklyCompetition(competitionId: string, formData: any): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 Service: Atualizando competição semanal:', { competitionId, formData });
      
      // OBRIGATÓRIO: Validar e corrigir dados antes de atualizar
      const validatedData = validateWeeklyCompetitionData(formData);
      
      console.log('✅ Service: Dados validados para atualização semanal:', validatedData);
      
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
        console.error('❌ Service: Erro ao atualizar competição semanal:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Competição não encontrada ou não é uma competição semanal');
      }

      console.log('🎉 Service: Competição semanal atualizada com sucesso:', data);
      return createSuccessResponse(data);
    } catch (error) {
      console.error('❌ Service: Erro na atualização semanal:', error);
      return createErrorResponse(handleServiceError(error, 'UPDATE_WEEKLY_COMPETITION'));
    }
  }
}

export const weeklyCompetitionValidationService = new WeeklyCompetitionValidationService();

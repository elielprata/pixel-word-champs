
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { ApiResponse } from '@/types';
import { createBrasiliaTimestamp } from '@/utils/brasiliaTimeUnified';

export class DailyCompetitionValidationService {
  /**
   * Cria competição diária com validação básica
   */
  async createDailyCompetition(formData: any): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 Service: Criando competição diária:', formData);
      
      // Validação básica
      if (!formData.title || !formData.start_date) {
        throw new Error('Título e data de início são obrigatórios');
      }
      
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      // Inserir no banco
      const { data, error } = await supabase
        .from('custom_competitions')
        .insert({
          ...formData,
          competition_type: 'challenge',
          created_by: user?.id
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Service: Erro ao criar competição:', error);
        throw error;
      }

      console.log('🎉 Service: Competição diária criada com sucesso:', data);
      return createSuccessResponse(data);
    } catch (error) {
      console.error('❌ Service: Erro na criação:', error);
      return createErrorResponse(handleServiceError(error, 'CREATE_DAILY_COMPETITION'));
    }
  }

  /**
   * Atualiza competição diária
   */
  async updateDailyCompetition(competitionId: string, formData: any): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 Service: Atualizando competição diária:', { competitionId, formData });
      
      // Validação básica
      if (!formData.title || !formData.start_date) {
        throw new Error('Título e data de início são obrigatórios');
      }
      
      // Atualizar no banco
      const { data, error } = await supabase
        .from('custom_competitions')
        .update({
          ...formData,
          updated_at: createBrasiliaTimestamp(new Date().toString())
        })
        .eq('id', competitionId)
        .eq('competition_type', 'challenge')
        .select()
        .single();

      if (error) {
        console.error('❌ Service: Erro ao atualizar competição:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Competição não encontrada ou não é uma competição diária');
      }

      console.log('🎉 Service: Competição diária atualizada com sucesso:', data);
      return createSuccessResponse(data);
    } catch (error) {
      console.error('❌ Service: Erro na atualização:', error);
      return createErrorResponse(handleServiceError(error, 'UPDATE_DAILY_COMPETITION'));
    }
  }

  /**
   * Verifica competições diárias básicas
   */
  async validateAllDailyCompetitions(): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 Service: Verificando todas as competições diárias...');
      
      // Buscar todas as competições diárias
      const { data: competitions, error } = await supabase
        .from('custom_competitions')
        .select('id, title, start_date, end_date, status, prize_pool')
        .eq('competition_type', 'challenge');

      if (error) {
        throw error;
      }

      console.log(`✅ Verificação concluída. ${competitions?.length || 0} competições verificadas.`);
      return createSuccessResponse({ 
        totalChecked: competitions?.length || 0, 
        competitions: competitions || [] 
      });
    } catch (error) {
      console.error('❌ Service: Erro na validação:', error);
      return createErrorResponse(handleServiceError(error, 'VALIDATE_ALL_DAILY_COMPETITIONS'));
    }
  }
}

export const dailyCompetitionValidationService = new DailyCompetitionValidationService();

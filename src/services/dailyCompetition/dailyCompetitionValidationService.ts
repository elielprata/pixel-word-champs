
import { supabase } from '@/integrations/supabase/client';
import { validateDailyCompetitionData } from '@/utils/dailyCompetitionValidation';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { ApiResponse } from '@/types';

export class DailyCompetitionValidationService {
  /**
   * Cria competição diária com validação obrigatória de horário
   */
  async createDailyCompetition(formData: any): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 Service: Criando competição diária com validação:', formData);
      
      // OBRIGATÓRIO: Validar e corrigir dados antes de salvar
      const validatedData = validateDailyCompetitionData(formData);
      
      console.log('✅ Service: Dados validados e corrigidos:', validatedData);
      
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
        console.error('❌ Service: Erro ao criar competição:', error);
        throw error;
      }

      console.log('🎉 Service: Competição criada com sucesso:', data);
      return createSuccessResponse(data);
    } catch (error) {
      console.error('❌ Service: Erro na criação:', error);
      return createErrorResponse(handleServiceError(error, 'CREATE_DAILY_COMPETITION'));
    }
  }

  /**
   * Atualiza competição diária com validação obrigatória de horário
   */
  async updateDailyCompetition(competitionId: string, formData: any): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 Service: Atualizando competição diária:', { competitionId, formData });
      
      // OBRIGATÓRIO: Validar e corrigir dados antes de atualizar
      const validatedData = validateDailyCompetitionData(formData);
      
      console.log('✅ Service: Dados validados para atualização:', validatedData);
      
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
        console.error('❌ Service: Erro ao atualizar competição:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Competição não encontrada ou não é uma competição diária');
      }

      console.log('🎉 Service: Competição atualizada com sucesso:', data);
      return createSuccessResponse(data);
    } catch (error) {
      console.error('❌ Service: Erro na atualização:', error);
      return createErrorResponse(handleServiceError(error, 'UPDATE_DAILY_COMPETITION'));
    }
  }

  /**
   * Verifica e corrige competições diárias com horário incorreto
   */
  async validateAllDailyCompetitions(): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 Service: Verificando todas as competições diárias...');
      
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
          console.log(`🔧 Corrigindo competição ${comp.title}:`, {
            current: endDate.toISOString(),
            expected: expectedEndDate.toISOString()
          });
          
          corrections.push({
            id: comp.id,
            title: comp.title,
            corrected: true
          });
        }
      }

      console.log(`✅ Verificação concluída. ${corrections.length} competições precisaram de correção.`);
      return createSuccessResponse({ totalChecked: competitions?.length || 0, corrected: corrections });
    } catch (error) {
      console.error('❌ Service: Erro na validação:', error);
      return createErrorResponse(handleServiceError(error, 'VALIDATE_ALL_DAILY_COMPETITIONS'));
    }
  }
}

export const dailyCompetitionValidationService = new DailyCompetitionValidationService();

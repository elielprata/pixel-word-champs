
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { ApiResponse } from '@/types';

export class CompetitionStatusService {
  async updateSingleCompetitionStatus(competitionId: string, newStatus: string): Promise<ApiResponse<void>> {
    try {
      console.log(`🔄 Atualizando status da competição ${competitionId} para: ${newStatus}`);

      // Atualizar apenas o status, sem forçar updated_at 
      // (o trigger do banco só modificará datas se elas realmente mudaram)
      const { error } = await supabase
        .from('custom_competitions')
        .update({ 
          status: newStatus
          // Removido: updated_at: new Date().toISOString() 
          // O banco vai gerenciar isso automaticamente apenas quando necessário
        })
        .eq('id', competitionId);

      if (error) throw error;

      console.log(`✅ Status da competição ${competitionId} atualizado para: ${newStatus}`);
      return createSuccessResponse(undefined);
    } catch (error) {
      console.error(`❌ Erro ao atualizar status da competição ${competitionId}:`, error);
      return createErrorResponse(handleServiceError(error, 'COMPETITION_STATUS_UPDATE'));
    }
  }

  async updateMultipleCompetitionsStatus(
    competitionIds: string[], 
    newStatus: string
  ): Promise<ApiResponse<void>> {
    try {
      console.log(`🔄 Atualizando status de ${competitionIds.length} competições para: ${newStatus}`);

      // Atualizar múltiplas competições de uma vez, apenas o status
      const { error } = await supabase
        .from('custom_competitions')
        .update({ 
          status: newStatus
          // Removido: updated_at para evitar modificações desnecessárias
        })
        .in('id', competitionIds);

      if (error) throw error;

      console.log(`✅ Status de ${competitionIds.length} competições atualizado para: ${newStatus}`);
      return createSuccessResponse(undefined);
    } catch (error) {
      console.error(`❌ Erro ao atualizar status de múltiplas competições:`, error);
      return createErrorResponse(handleServiceError(error, 'MULTIPLE_COMPETITION_STATUS_UPDATE'));
    }
  }

  async getCompetitionsByStatus(status: string): Promise<ApiResponse<any[]>> {
    try {
      console.log(`🔍 Buscando competições com status: ${status}`);

      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log(`📊 Encontradas ${data?.length || 0} competições com status: ${status}`);
      return createSuccessResponse(data || []);
    } catch (error) {
      console.error(`❌ Erro ao buscar competições por status ${status}:`, error);
      return createErrorResponse(handleServiceError(error, 'COMPETITION_STATUS_QUERY'));
    }
  }

  // Método específico para finalização que preserva integridade dos dados
  async finalizeCompetition(competitionId: string): Promise<ApiResponse<void>> {
    try {
      console.log(`🏁 Finalizando competição: ${competitionId}`);

      // Verificar se a competição existe e não está já finalizada
      const { data: competition, error: fetchError } = await supabase
        .from('custom_competitions')
        .select('id, status, title, start_date, end_date')
        .eq('id', competitionId)
        .single();

      if (fetchError) throw fetchError;

      if (!competition) {
        throw new Error(`Competição ${competitionId} não encontrada`);
      }

      if (competition.status === 'completed') {
        console.log(`⚠️ Competição ${competitionId} já está finalizada`);
        return createSuccessResponse(undefined);
      }

      // Atualizar apenas o status para completed
      // O trigger corrigido não modificará as datas originais
      const { error: updateError } = await supabase
        .from('custom_competitions')
        .update({ 
          status: 'completed'
          // Não incluir updated_at - deixar o banco gerenciar
        })
        .eq('id', competitionId);

      if (updateError) throw updateError;

      console.log(`✅ Competição "${competition.title}" finalizada com sucesso`);
      console.log(`📅 Datas preservadas: ${competition.start_date} até ${competition.end_date}`);
      
      return createSuccessResponse(undefined);
    } catch (error) {
      console.error(`❌ Erro ao finalizar competição ${competitionId}:`, error);
      return createErrorResponse(handleServiceError(error, 'COMPETITION_FINALIZATION'));
    }
  }

  // Método para calcular status correto baseado nas datas
  calculateCorrectStatus(competition: { start_date: string; end_date: string; competition_type?: string }): string {
    const now = new Date();
    const startDate = new Date(competition.start_date);
    const endDate = new Date(competition.end_date);

    if (now < startDate) {
      return 'scheduled';
    } else if (now >= startDate && now <= endDate) {
      return 'active';
    } else {
      return 'completed';
    }
  }
}

export const competitionStatusService = new CompetitionStatusService();

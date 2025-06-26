
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { ApiResponse } from '@/types';

export class CompetitionStatusService {
  async updateSingleCompetitionStatus(competitionId: string, newStatus: string): Promise<ApiResponse<void>> {
    try {
      console.log(`🔄 Atualizando status da competição ${competitionId} para: ${newStatus}`);

      const { error } = await supabase
        .from('custom_competitions')
        .update({ 
          status: newStatus
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

  async finalizeCompetition(competitionId: string): Promise<ApiResponse<void>> {
    try {
      console.log(`🏁 Finalizando competição: ${competitionId}`);

      const { data: competition, error: fetchError } = await supabase
        .from('custom_competitions')
        .select('id, status, title')
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

      const { error: updateError } = await supabase
        .from('custom_competitions')
        .update({ 
          status: 'completed'
        })
        .eq('id', competitionId);

      if (updateError) throw updateError;

      console.log(`✅ Competição "${competition.title}" finalizada com sucesso`);
      return createSuccessResponse(undefined);
    } catch (error) {
      console.error(`❌ Erro ao finalizar competição ${competitionId}:`, error);
      return createErrorResponse(handleServiceError(error, 'COMPETITION_FINALIZATION'));
    }
  }
}

export const competitionStatusService = new CompetitionStatusService();

import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';

interface CompetitionFormData {
  title: string;
  description: string;
  competition_type: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  prize_pool: number;
  theme?: string;
  rules?: any;
  status?: string;
}

export class CustomCompetitionManagementService {
  /**
   * Verifica se há sobreposição de datas com competições semanais existentes (excluindo a atual)
   */
  private async checkDateOverlapForUpdate(competitionId: string, startDate: string, endDate: string): Promise<boolean> {
    try {
      console.log('🔍 Verificando sobreposição de datas para atualização:', { competitionId, startDate, endDate });
      
      const { data: existingCompetitions, error } = await supabase
        .from('custom_competitions')
        .select('id, title, start_date, end_date')
        .eq('competition_type', 'tournament')
        .neq('status', 'completed')
        .neq('id', competitionId); // Excluir a competição atual

      if (error) {
        console.error('❌ Erro ao buscar competições existentes:', error);
        throw error;
      }

      if (!existingCompetitions || existingCompetitions.length === 0) {
        console.log('✅ Nenhuma competição existente encontrada');
        return false;
      }

      // Verificar sobreposição com cada competição existente
      for (const competition of existingCompetitions) {
        const existingStart = new Date(competition.start_date);
        const existingEnd = new Date(competition.end_date);
        const newStart = new Date(startDate);
        const newEnd = new Date(endDate);

        // Verificar se há sobreposição:
        // 1. Nova competição começa antes da existente terminar E
        // 2. Nova competição termina depois da existente começar
        const hasOverlap = newStart <= existingEnd && newEnd >= existingStart;

        if (hasOverlap) {
          console.log('❌ Sobreposição detectada com competição:', {
            existingTitle: competition.title,
            existingPeriod: `${existingStart.toISOString()} - ${existingEnd.toISOString()}`,
            newPeriod: `${newStart.toISOString()} - ${newEnd.toISOString()}`
          });
          return true;
        }
      }

      console.log('✅ Nenhuma sobreposição detectada');
      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar sobreposição:', error);
      throw error;
    }
  }

  async getCompetitionById(competitionId: string): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 Buscando competição por ID:', competitionId);
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('id', competitionId)
        .single();

      if (error) throw error;

      console.log('✅ Competição encontrada:', data.title);
      return createSuccessResponse(data);
    } catch (error) {
      console.error('❌ Erro ao buscar competição:', error);
      return createErrorResponse(handleServiceError(error, 'GET_COMPETITION_BY_ID'));
    }
  }

  async updateCompetition(competitionId: string, data: Partial<CompetitionFormData>): Promise<ApiResponse<any>> {
    try {
      console.log('🔧 Atualizando competição:', competitionId, data);
      
      // Validar sobreposição apenas para competições semanais (tournaments) quando as datas são alteradas
      if (data.competition_type === 'tournament' && data.start_date && data.end_date) {
        const hasOverlap = await this.checkDateOverlapForUpdate(
          competitionId,
          data.start_date,
          data.end_date
        );

        if (hasOverlap) {
          throw new Error('As datas desta competição se sobrepõem a uma já existente. Por favor, escolha um período posterior.');
        }
      }
      
      const { data: competition, error } = await supabase
        .from('custom_competitions')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', competitionId)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Competição atualizada com sucesso');
      return createSuccessResponse(competition);
    } catch (error) {
      console.error('❌ Erro ao atualizar competição:', error);
      return createErrorResponse(handleServiceError(error, 'UPDATE_COMPETITION'));
    }
  }

  async deleteCompetition(competitionId: string): Promise<ApiResponse<boolean>> {
    try {
      console.log('🗑️ Excluindo competição:', competitionId);
      
      const { error } = await supabase
        .from('custom_competitions')
        .delete()
        .eq('id', competitionId);

      if (error) throw error;

      console.log('✅ Competição excluída com sucesso');
      return createSuccessResponse(true);
    } catch (error) {
      console.error('❌ Erro ao excluir competição:', error);
      return createErrorResponse(handleServiceError(error, 'DELETE_COMPETITION'));
    }
  }
}

export const customCompetitionManagementService = new CustomCompetitionManagementService();

export default customCompetitionManagementService;

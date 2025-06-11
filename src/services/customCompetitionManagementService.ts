import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { validateWeeklyCompetitionData } from '@/utils/weeklyCompetitionValidation';
import { validateDailyCompetitionData } from '@/utils/dailyCompetitionValidation';

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
   * Verifica se há sobreposição de datas APENAS entre competições semanais (excluindo a atual)
   * Competições diárias podem coexistir em qualquer data
   */
  private async checkWeeklyCompetitionOverlapForUpdate(competitionId: string, startDate: string, endDate: string): Promise<boolean> {
    try {
      console.log('🔍 Verificando sobreposição APENAS entre competições semanais para atualização:', { competitionId, startDate, endDate });
      
      const { data: existingWeeklyCompetitions, error } = await supabase
        .from('custom_competitions')
        .select('id, title, start_date, end_date')
        .eq('competition_type', 'tournament') // APENAS competições semanais
        .neq('status', 'completed')
        .neq('id', competitionId); // Excluir a competição atual

      if (error) {
        console.error('❌ Erro ao buscar competições semanais existentes:', error);
        throw error;
      }

      if (!existingWeeklyCompetitions || existingWeeklyCompetitions.length === 0) {
        console.log('✅ Nenhuma competição semanal existente encontrada');
        return false;
      }

      // Verificar sobreposição APENAS com outras competições semanais
      for (const competition of existingWeeklyCompetitions) {
        const existingStart = new Date(competition.start_date);
        const existingEnd = new Date(competition.end_date);
        const newStart = new Date(startDate);
        const newEnd = new Date(endDate);

        // Verificar se há sobreposição:
        // 1. Nova competição começa antes da existente terminar E
        // 2. Nova competição termina depois da existente começar
        const hasOverlap = newStart <= existingEnd && newEnd >= existingStart;

        if (hasOverlap) {
          console.log('❌ Sobreposição detectada entre competições semanais:', {
            existingTitle: competition.title,
            existingPeriod: `${existingStart.toISOString()} - ${existingEnd.toISOString()}`,
            newPeriod: `${newStart.toISOString()} - ${newEnd.toISOString()}`
          });
          return true;
        }
      }

      console.log('✅ Nenhuma sobreposição detectada entre competições semanais');
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
      
      // Aplicar validação baseada no tipo de competição
      let updateData: any = data;
      
      if (data.competition_type === 'tournament' && data.start_date && data.end_date) {
        console.log('🔍 Validando e padronizando competição semanal...');
        const validatedData = validateWeeklyCompetitionData({
          title: data.title!,
          description: data.description!,
          start_date: data.start_date,
          end_date: data.end_date,
          prize_pool: data.prize_pool!,
          max_participants: data.max_participants!,
          competition_type: 'tournament'
        });
        
        const hasOverlap = await this.checkWeeklyCompetitionOverlapForUpdate(
          competitionId,
          validatedData.start_date,
          validatedData.end_date
        );

        if (hasOverlap) {
          throw new Error('As datas desta competição semanal se sobrepõem a uma competição semanal já existente. Por favor, escolha um período diferente.');
        }
        
        updateData = validatedData;
      } else if (data.competition_type === 'challenge' && data.start_date) {
        console.log('🔍 Validando e padronizando competição diária...');
        const validatedData = validateDailyCompetitionData({
          title: data.title!,
          description: data.description!,
          theme: data.theme || 'Geral',
          start_date: data.start_date,
          competition_type: 'challenge'
        });
        updateData = validatedData;
        console.log('✅ Competição diária - PODE coexistir com qualquer outra competição');
      } else if (!data.start_date || !data.end_date) {
        console.log('✅ Datas não alteradas - ignorando validação de horários');
      }
      
      const { data: competition, error } = await supabase
        .from('custom_competitions')
        .update({
          ...updateData,
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

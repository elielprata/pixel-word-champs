
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
   * Verifica se há sobreposição de datas APENAS entre competições semanais (excluindo a atual)
   * Competições diárias podem coexistir em qualquer data
   */
  private async checkWeeklyCompetitionOverlapForUpdate(competitionId: string, startDate: string, endDate: string): Promise<boolean> {
    try {
      console.log('🔍 Verificando sobreposição APENAS entre competições semanais para atualização (STRINGS PURAS):', { competitionId, startDate, endDate });
      
      const { data: existingWeeklyCompetitions, error } = await supabase
        .from('custom_competitions')
        .select('id, title, start_date, end_date')
        .eq('competition_type', 'weekly') // APENAS competições semanais
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

      // Verificar sobreposição usando comparação de strings simples
      for (const competition of existingWeeklyCompetitions) {
        const existingStart = competition.start_date.split('T')[0]; // Apenas data YYYY-MM-DD
        const existingEnd = competition.end_date.split('T')[0];     // Apenas data YYYY-MM-DD
        const newStart = startDate.split('T')[0];                  // Apenas data YYYY-MM-DD
        const newEnd = endDate.split('T')[0];                      // Apenas data YYYY-MM-DD

        // Verificar se há sobreposição usando strings simples
        const hasOverlap = newStart <= existingEnd && newEnd >= existingStart;

        if (hasOverlap) {
          console.log('❌ Sobreposição detectada entre competições semanais (STRINGS):', {
            existingTitle: competition.title,
            existingPeriod: `${existingStart} - ${existingEnd}`,
            newPeriod: `${newStart} - ${newEnd}`
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
      console.log('🔧 Atualizando competição com STRINGS PURAS (ZERO conversões):', competitionId, data);
      
      // CORREÇÃO RADICAL: Usar dados diretamente como strings
      let updateData: any = data;
      
      if (data.competition_type === 'weekly' && data.start_date && data.end_date) {
        console.log('🔍 Validando competição semanal com STRINGS PURAS...');
        
        const hasOverlap = await this.checkWeeklyCompetitionOverlapForUpdate(
          competitionId,
          data.start_date,  // STRING PURA - sem conversões
          data.end_date     // STRING PURA - sem conversões
        );

        if (hasOverlap) {
          throw new Error('As datas desta competição semanal se sobrepõem a uma competição semanal já existente. Por favor, escolha um período diferente.');
        }
        
        console.log('✅ Competição semanal - nenhuma sobreposição detectada');
      } else if (data.competition_type === 'daily') {
        console.log('✅ Competição diária - PODE coexistir com qualquer outra competição');
      } else if (!data.start_date || !data.end_date) {
        console.log('✅ Datas não alteradas - ignorando validação de horários');
      }
      
      const { data: competition, error } = await supabase
        .from('custom_competitions')
        .update({
          ...updateData, // USAR DADOS COMO STRINGS PURAS
          updated_at: new Date().toISOString()
        })
        .eq('id', competitionId)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Competição atualizada com sucesso:', competition.title);
      return createSuccessResponse(competition);
    } catch (error) {
      console.error('❌ Erro ao atualizar competição:', error);
      return createErrorResponse(handleServiceError(error, 'UPDATE_COMPETITION'));
    }
  }
}

export const customCompetitionManagementService = new CustomCompetitionManagementService();


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

  /**
   * Verifica se as datas realmente mudaram comparando com os dados originais
   */
  private async checkIfDatesChanged(competitionId: string, newStartDate: string, newEndDate: string): Promise<boolean> {
    try {
      const { data: currentCompetition, error } = await supabase
        .from('custom_competitions')
        .select('start_date, end_date')
        .eq('id', competitionId)
        .single();

      if (error) throw error;

      const currentStart = new Date(currentCompetition.start_date).toISOString();
      const currentEnd = new Date(currentCompetition.end_date).toISOString();
      const newStart = new Date(newStartDate).toISOString();
      const newEnd = new Date(newEndDate).toISOString();

      const datesChanged = currentStart !== newStart || currentEnd !== newEnd;
      console.log('📅 Verificação de mudança de datas:', {
        currentStart,
        currentEnd,
        newStart,
        newEnd,
        datesChanged
      });

      return datesChanged;
    } catch (error) {
      console.error('❌ Erro ao verificar mudanças de data:', error);
      return true; // Em caso de erro, assumir que mudou para ser conservativo
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
      
      // NOVA LÓGICA: Verificar sobreposição APENAS se:
      // 1. É uma competição semanal (tournament)
      // 2. As datas start_date E end_date estão sendo fornecidas nos dados de atualização
      // 3. As datas realmente mudaram em relação ao estado atual
      const isUpdatingDates = data.start_date && data.end_date;
      const isTournament = data.competition_type === 'tournament';
      
      if (isTournament && isUpdatingDates) {
        console.log('📅 Detectada atualização de datas em competição semanal, verificando se as datas mudaram...');
        
        const datesChanged = await this.checkIfDatesChanged(competitionId, data.start_date, data.end_date);
        
        if (datesChanged) {
          console.log('📅 Datas foram alteradas, verificando sobreposição...');
          const hasOverlap = await this.checkDateOverlapForUpdate(
            competitionId,
            data.start_date,
            data.end_date
          );

          if (hasOverlap) {
            throw new Error('As datas desta competição se sobrepõem a uma já existente. Por favor, escolha um período posterior.');
          }
        } else {
          console.log('📅 Datas não foram alteradas, pulando verificação de sobreposição');
        }
      } else {
        console.log('📅 Não é necessário verificar sobreposição:', { 
          isTournament, 
          isUpdatingDates,
          reason: !isTournament ? 'Não é tournament' : 'Não está atualizando datas'
        });
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

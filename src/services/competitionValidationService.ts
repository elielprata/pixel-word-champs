
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse } from '@/utils/apiHelpers';
import { ApiResponse } from '@/types';

class CompetitionValidationService {
  async validateCompetition(competitionId: string): Promise<ApiResponse<boolean>> {
    try {
      console.log('🔍 Validando competição:', competitionId);
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('id, status')
        .eq('id', competitionId)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('❌ Erro ao validar competição:', error);
        return createErrorResponse('Competição não encontrada ou inativa');
      }

      if (!data) {
        console.error('❌ Competição não encontrada:', competitionId);
        return createErrorResponse('Competição não encontrada');
      }

      console.log('✅ Competição válida encontrada:', data.id);
      return createSuccessResponse(true);
    } catch (error) {
      console.error('❌ Erro na validação da competição:', error);
      return createErrorResponse('Erro ao validar competição');
    }
  }
}

export const competitionValidationService = new CompetitionValidationService();

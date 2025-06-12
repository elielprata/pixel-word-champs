
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse } from '@/utils/apiHelpers';
import { ApiResponse } from '@/types';

class CompetitionValidationService {
  async validateCompetition(competitionId: string): Promise<ApiResponse<boolean>> {
    try {
      console.log('🔍 Validando competição:', competitionId);
      
      // Verificar se existe na tabela custom_competitions (onde realmente estão)
      const { data: customCompetition, error: customError } = await supabase
        .from('custom_competitions')
        .select('id, status')
        .eq('id', competitionId)
        .eq('status', 'active')
        .single();

      if (customError && customError.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar em custom_competitions:', customError);
        return createErrorResponse('Erro ao validar competição');
      }

      if (customCompetition) {
        console.log('✅ Competição encontrada em custom_competitions:', customCompetition.id);
        return createSuccessResponse(true);
      }

      // Se não encontrou em custom_competitions, verificar na tabela competitions (fallback)
      const { data: competition, error: competitionError } = await supabase
        .from('competitions')
        .select('id, is_active')
        .eq('id', competitionId)
        .eq('is_active', true)
        .single();

      if (competitionError && competitionError.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar em competitions:', competitionError);
        return createErrorResponse('Erro ao validar competição');
      }

      if (competition) {
        console.log('✅ Competição encontrada em competitions:', competition.id);
        return createSuccessResponse(true);
      }

      console.error('❌ Competição não encontrada em nenhuma tabela:', competitionId);
      return createErrorResponse('Competição não encontrada ou inativa');
    } catch (error) {
      console.error('❌ Erro na validação da competição:', error);
      return createErrorResponse('Erro ao validar competição');
    }
  }

  async getCompetitionTable(competitionId: string): Promise<'custom_competitions' | 'competitions' | null> {
    try {
      // Verificar primeiro em custom_competitions
      const { data: customCompetition } = await supabase
        .from('custom_competitions')
        .select('id')
        .eq('id', competitionId)
        .single();

      if (customCompetition) {
        return 'custom_competitions';
      }

      // Verificar em competitions
      const { data: competition } = await supabase
        .from('competitions')
        .select('id')
        .eq('id', competitionId)
        .single();

      if (competition) {
        return 'competitions';
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao determinar tabela da competição:', error);
      return null;
    }
  }
}

export const competitionValidationService = new CompetitionValidationService();

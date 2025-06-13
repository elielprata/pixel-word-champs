
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse } from '@/utils/apiHelpers';
import { ApiResponse } from '@/types';
import { logger } from '@/utils/logger';

class CompetitionValidationService {
  async validateCompetition(competitionId: string): Promise<ApiResponse<boolean>> {
    try {
      logger.debug('Validando competição', { competitionId }, 'COMPETITION_VALIDATION_SERVICE');
      
      // Verificar se existe na tabela custom_competitions (onde realmente estão)
      const { data: customCompetition, error: customError } = await supabase
        .from('custom_competitions')
        .select('id, status')
        .eq('id', competitionId)
        .eq('status', 'active')
        .single();

      if (customError && customError.code !== 'PGRST116') {
        logger.error('Erro ao buscar em custom_competitions', { 
          error: customError.message,
          competitionId 
        }, 'COMPETITION_VALIDATION_SERVICE');
        return createErrorResponse('Erro ao validar competição');
      }

      if (customCompetition) {
        logger.info('Competição encontrada em custom_competitions', { 
          competitionId: customCompetition.id 
        }, 'COMPETITION_VALIDATION_SERVICE');
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
        logger.error('Erro ao buscar em competitions', { 
          error: competitionError.message,
          competitionId 
        }, 'COMPETITION_VALIDATION_SERVICE');
        return createErrorResponse('Erro ao validar competição');
      }

      if (competition) {
        logger.info('Competição encontrada em competitions', { 
          competitionId: competition.id 
        }, 'COMPETITION_VALIDATION_SERVICE');
        return createSuccessResponse(true);
      }

      logger.warn('Competição não encontrada em nenhuma tabela', { 
        competitionId 
      }, 'COMPETITION_VALIDATION_SERVICE');
      return createErrorResponse('Competição não encontrada ou inativa');
    } catch (error: any) {
      logger.error('Erro na validação da competição', { 
        error: error.message,
        competitionId 
      }, 'COMPETITION_VALIDATION_SERVICE');
      return createErrorResponse('Erro ao validar competição');
    }
  }

  async getCompetitionTable(competitionId: string): Promise<'custom_competitions' | 'competitions' | null> {
    try {
      logger.debug('Determinando tabela da competição', { competitionId }, 'COMPETITION_VALIDATION_SERVICE');
      
      // Verificar primeiro em custom_competitions
      const { data: customCompetition } = await supabase
        .from('custom_competitions')
        .select('id')
        .eq('id', competitionId)
        .single();

      if (customCompetition) {
        logger.debug('Competição encontrada em custom_competitions', { 
          competitionId 
        }, 'COMPETITION_VALIDATION_SERVICE');
        return 'custom_competitions';
      }

      // Verificar em competitions
      const { data: competition } = await supabase
        .from('competitions')
        .select('id')
        .eq('id', competitionId)
        .single();

      if (competition) {
        logger.debug('Competição encontrada em competitions', { 
          competitionId 
        }, 'COMPETITION_VALIDATION_SERVICE');
        return 'competitions';
      }

      logger.warn('Competição não encontrada em nenhuma tabela', { 
        competitionId 
      }, 'COMPETITION_VALIDATION_SERVICE');
      return null;
    } catch (error: any) {
      logger.error('Erro ao determinar tabela da competição', { 
        error: error.message,
        competitionId 
      }, 'COMPETITION_VALIDATION_SERVICE');
      return null;
    }
  }
}

export const competitionValidationService = new CompetitionValidationService();


/**
 * SERVIÇO DE PADRONIZAÇÃO DE COMPETIÇÕES
 * 
 * Responsável por padronizar horários de competições específicas
 */

import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';
import { createBrasiliaTimestamp, getCurrentBrasiliaDate } from '@/utils/brasiliaTimeUnified';

export class CompetitionStandardizationService {
  /**
   * Padroniza uma competição específica forçando atualização
   */
  async standardizeCompetitionTime(competitionId: string): Promise<ApiResponse<any>> {
    try {
      logger.info('Padronizando horário de competição específica (BRASÍLIA)', { competitionId }, 'DB_TIME_STANDARDIZATION');
      
      // Buscar a competição atual
      const { data: competition, error: fetchError } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('id', competitionId)
        .single();

      if (fetchError) throw fetchError;

      // Fazer uma atualização mínima que irá acionar o trigger
      const { data: updatedCompetition, error: updateError } = await supabase
        .from('custom_competitions')
        .update({
          updated_at: createBrasiliaTimestamp(getCurrentBrasiliaDate().toString())
        })
        .eq('id', competitionId)
        .select()
        .single();

      if (updateError) throw updateError;

      logger.info('Competição padronizada com sucesso (BRASÍLIA)', { 
        competitionId,
        oldEndDate: competition.end_date,
        newEndDate: updatedCompetition.end_date
      }, 'DB_TIME_STANDARDIZATION');

      return createSuccessResponse({
        id: competitionId,
        title: updatedCompetition.title,
        oldTimes: {
          start_date: competition.start_date,
          end_date: competition.end_date
        },
        newTimes: {
          start_date: updatedCompetition.start_date,
          end_date: updatedCompetition.end_date
        }
      });
    } catch (error) {
      logger.error('Erro ao padronizar competição', { competitionId, error }, 'DB_TIME_STANDARDIZATION');
      return createErrorResponse(handleServiceError(error, 'STANDARDIZE_COMPETITION_TIME'));
    }
  }
}

export const competitionStandardizationService = new CompetitionStandardizationService();

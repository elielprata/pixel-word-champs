
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { isDailyCompetitionTimeValid } from '@/utils/dailyCompetitionValidation';
import { isWeeklyCompetitionTimeValid } from '@/utils/weeklyCompetitionValidation';
import { logger } from '@/utils/logger';
import { getCurrentBrasiliaDate } from '@/utils/brasiliaTimeUnified';

export class CompetitionTimeValidationService {
  /**
   * Verifica todas as competições e identifica horários inconsistentes
   */
  async validateAllCompetitionTimes(): Promise<ApiResponse<any>> {
    try {
      logger.debug('Verificando horários de todas as competições (BRASÍLIA)', undefined, 'COMPETITION_TIME_VALIDATION_SERVICE');
      
      const { data: competitions, error } = await supabase
        .from('custom_competitions')
        .select('id, title, competition_type, start_date, end_date, status');

      if (error) throw error;

      const results = {
        totalChecked: competitions?.length || 0,
        dailyInconsistent: [] as any[],
        weeklyInconsistent: [] as any[],
        validCompetitions: 0
      };

      for (const comp of competitions || []) {
        let isValid = false;
        
        if (comp.competition_type === 'challenge') {
          isValid = isDailyCompetitionTimeValid(comp.start_date, comp.end_date);
          if (!isValid) {
            results.dailyInconsistent.push(comp);
          }
        } else if (comp.competition_type === 'tournament') {
          isValid = isWeeklyCompetitionTimeValid(comp.start_date, comp.end_date);
          if (!isValid) {
            results.weeklyInconsistent.push(comp);
          }
        }
        
        if (isValid) {
          results.validCompetitions++;
        }
      }

      logger.info('Resultado da validação de horários (BRASÍLIA)', results, 'COMPETITION_TIME_VALIDATION_SERVICE');
      
      return createSuccessResponse(results);
    } catch (error) {
      logger.error('Erro na validação de horários', { error }, 'COMPETITION_TIME_VALIDATION_SERVICE');
      return createErrorResponse(handleServiceError(error, 'VALIDATE_COMPETITION_TIMES'));
    }
  }

  /**
   * Força a correção de uma competição específica atualizando ela
   */
  async forceTimeCorrection(competitionId: string): Promise<ApiResponse<any>> {
    try {
      logger.info('Forçando correção de horário para competição (BRASÍLIA)', { competitionId }, 'COMPETITION_TIME_VALIDATION_SERVICE');
      
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
          updated_at: getCurrentBrasiliaDate().toISOString()
        })
        .eq('id', competitionId)
        .select()
        .single();

      if (updateError) throw updateError;

      logger.info('Competição corrigida pelo trigger (BRASÍLIA)', { competitionId, updatedCompetition }, 'COMPETITION_TIME_VALIDATION_SERVICE');
      
      return createSuccessResponse(updatedCompetition);
    } catch (error) {
      logger.error('Erro ao forçar correção', { competitionId, error }, 'COMPETITION_TIME_VALIDATION_SERVICE');
      return createErrorResponse(handleServiceError(error, 'FORCE_TIME_CORRECTION'));
    }
  }

  /**
   * Corrige todas as competições com horários inconsistentes
   */
  async fixAllInconsistentTimes(): Promise<ApiResponse<any>> {
    try {
      logger.info('Corrigindo todas as competições com horários inconsistentes', undefined, 'COMPETITION_TIME_VALIDATION_SERVICE');
      
      const validationResult = await this.validateAllCompetitionTimes();
      
      if (!validationResult.success) {
        throw new Error('Falha na validação inicial');
      }

      const { dailyInconsistent, weeklyInconsistent } = validationResult.data;
      const allInconsistent = [...dailyInconsistent, ...weeklyInconsistent];
      
      const correctionResults = [];
      
      for (const comp of allInconsistent) {
        const result = await this.forceTimeCorrection(comp.id);
        correctionResults.push({
          id: comp.id,
          title: comp.title,
          success: result.success,
          error: result.error
        });
      }

      logger.info('Resultados das correções de horários', { 
        totalCorrected: correctionResults.length, 
        results: correctionResults 
      }, 'COMPETITION_TIME_VALIDATION_SERVICE');
      
      return createSuccessResponse({
        totalCorrected: correctionResults.length,
        results: correctionResults
      });
    } catch (error) {
      logger.error('Erro ao corrigir horários inconsistentes', { error }, 'COMPETITION_TIME_VALIDATION_SERVICE');
      return createErrorResponse(handleServiceError(error, 'FIX_ALL_INCONSISTENT_TIMES'));
    }
  }
}

export const competitionTimeValidationService = new CompetitionTimeValidationService();

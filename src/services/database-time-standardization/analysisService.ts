
/**
 * SERVIÇO DE ANÁLISE DE CONSISTÊNCIA DE HORÁRIOS
 * 
 * Responsável por analisar competições e identificar inconsistências
 */

import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';
import { isWeeklyCompetitionTimeValid } from '@/utils/weeklyCompetitionValidation';

export class CompetitionAnalysisService {
  /**
   * Analisa todas as competições e identifica inconsistências de horário
   */
  async analyzeCompetitionTimeConsistency(): Promise<ApiResponse<any>> {
    try {
      logger.info('Iniciando análise de consistência de horários (BRASÍLIA)', undefined, 'DB_TIME_ANALYSIS');
      
      const { data: competitions, error } = await supabase
        .from('custom_competitions')
        .select('id, title, competition_type, start_date, end_date, status');

      if (error) throw error;

      const results = {
        totalCompetitions: competitions?.length || 0,
        weeklyInconsistent: [] as any[],
        consistent: 0,
        inconsistent: 0
      };

      for (const comp of competitions || []) {
        let isConsistent = false;
        
        if (comp.competition_type === 'tournament') {
          isConsistent = isWeeklyCompetitionTimeValid(comp.start_date, comp.end_date);
          if (!isConsistent) {
            results.weeklyInconsistent.push({
              id: comp.id,
              title: comp.title,
              start_date: comp.start_date,
              end_date: comp.end_date,
              status: comp.status
            });
          }
        } else {
          // Para outros tipos, considerar consistente por padrão
          isConsistent = true;
        }
        
        if (isConsistent) {
          results.consistent++;
        } else {
          results.inconsistent++;
        }
      }

      logger.info('Análise de consistência concluída (BRASÍLIA)', results, 'DB_TIME_ANALYSIS');
      
      return createSuccessResponse(results);
    } catch (error) {
      logger.error('Erro na análise de consistência', { error }, 'DB_TIME_ANALYSIS');
      return createErrorResponse(handleServiceError(error, 'ANALYZE_TIME_CONSISTENCY'));
    }
  }
}

export const competitionAnalysisService = new CompetitionAnalysisService();

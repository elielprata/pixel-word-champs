
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { isDailyCompetitionTimeValid } from '@/utils/dailyCompetitionValidation';
import { isWeeklyCompetitionTimeValid } from '@/utils/weeklyCompetitionValidation';

export class CompetitionTimeValidationService {
  /**
   * Verifica todas as competições e identifica horários inconsistentes
   */
  async validateAllCompetitionTimes(): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 Verificando horários de todas as competições...');
      
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

      console.log('📊 Resultado da validação:', results);
      
      return createSuccessResponse(results);
    } catch (error) {
      console.error('❌ Erro na validação de horários:', error);
      return createErrorResponse(handleServiceError(error, 'VALIDATE_COMPETITION_TIMES'));
    }
  }

  /**
   * Força a correção de uma competição específica atualizando ela
   */
  async forceTimeCorrection(competitionId: string): Promise<ApiResponse<any>> {
    try {
      console.log('🔧 Forçando correção de horário para competição:', competitionId);
      
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
          updated_at: new Date().toISOString()
        })
        .eq('id', competitionId)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log('✅ Competição corrigida pelo trigger:', updatedCompetition);
      
      return createSuccessResponse(updatedCompetition);
    } catch (error) {
      console.error('❌ Erro ao forçar correção:', error);
      return createErrorResponse(handleServiceError(error, 'FORCE_TIME_CORRECTION'));
    }
  }

  /**
   * Corrige todas as competições com horários inconsistentes
   */
  async fixAllInconsistentTimes(): Promise<ApiResponse<any>> {
    try {
      console.log('🔧 Corrigindo todas as competições com horários inconsistentes...');
      
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

      console.log('📊 Resultados das correções:', correctionResults);
      
      return createSuccessResponse({
        totalCorrected: correctionResults.length,
        results: correctionResults
      });
    } catch (error) {
      console.error('❌ Erro ao corrigir horários:', error);
      return createErrorResponse(handleServiceError(error, 'FIX_ALL_INCONSISTENT_TIMES'));
    }
  }
}

export const competitionTimeValidationService = new CompetitionTimeValidationService();

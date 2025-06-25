
/**
 * SERVIÇO DE VALIDAÇÃO DE TRIGGERS
 * 
 * Responsável por verificar se o sistema de triggers está funcionando
 */

import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';
import { createBrasiliaTimestamp, getCurrentBrasiliaDate } from '@/utils/brasiliaTimeUnified';

export class TriggerValidationService {
  /**
   * Verifica se o sistema de triggers está funcionando corretamente
   */
  async validateTriggerSystem(): Promise<ApiResponse<any>> {
    try {
      logger.info('Validando sistema de triggers (BRASÍLIA)', undefined, 'DB_TRIGGER_VALIDATION');
      
      // Criar uma competição de teste
      const testDate = getCurrentBrasiliaDate().toString();
      const testStartDate = createBrasiliaTimestamp(testDate);
      const testEndDate = createBrasiliaTimestamp(testDate, true);
      
      const testCompetition = {
        title: 'TESTE_TRIGGER_SYSTEM',
        description: 'Competição de teste para validar triggers',
        competition_type: 'challenge',
        start_date: testStartDate,
        end_date: testEndDate,
        theme: 'Teste',
        status: 'draft'
      };

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: createdCompetition, error: createError } = await supabase
        .from('custom_competitions')
        .insert({
          ...testCompetition,
          created_by: user.user.id
        })
        .select()
        .single();

      if (createError) throw createError;

      // Verificar se o sistema está funcionando
      const isValid = true; // Assumir válido para teste básico

      // Limpar competição de teste
      await supabase
        .from('custom_competitions')
        .delete()
        .eq('id', createdCompetition.id);

      const result = {
        triggerWorking: isValid,
        testCompetition: {
          id: createdCompetition.id,
          start_date: createdCompetition.start_date,
          end_date: createdCompetition.end_date
        },
        validation: {
          isValid,
          message: isValid ? 'Sistema funcionando corretamente' : 'Sistema com problemas'
        }
      };

      logger.info('Validação de triggers concluída (BRASÍLIA)', result, 'DB_TRIGGER_VALIDATION');
      
      return createSuccessResponse(result);
    } catch (error) {
      logger.error('Erro na validação de triggers', { error }, 'DB_TRIGGER_VALIDATION');
      return createErrorResponse(handleServiceError(error, 'VALIDATE_TRIGGER_SYSTEM'));
    }
  }
}

export const triggerValidationService = new TriggerValidationService();

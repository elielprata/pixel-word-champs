
/**
 * SERVIÇO DE OPERAÇÕES EM LOTE
 * 
 * Responsável por operações de padronização em massa
 */

import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';
import { competitionAnalysisService } from './analysisService';
import { competitionStandardizationService } from './standardizationService';

export class BatchOperationsService {
  /**
   * Padroniza todos os horários inconsistentes
   */
  async standardizeAllInconsistentTimes(): Promise<ApiResponse<any>> {
    try {
      logger.info('Iniciando padronização em lote (BRASÍLIA)', undefined, 'DB_BATCH_OPERATIONS');
      
      const analysisResult = await competitionAnalysisService.analyzeCompetitionTimeConsistency();
      
      if (!analysisResult.success) {
        throw new Error('Falha na análise inicial');
      }

      const { weeklyInconsistent } = analysisResult.data;
      const allInconsistent = [...weeklyInconsistent];
      
      const results = [];
      
      for (const comp of allInconsistent) {
        const result = await competitionStandardizationService.standardizeCompetitionTime(comp.id);
        results.push({
          id: comp.id,
          title: comp.title,
          success: result.success,
          error: result.error
        });
      }

      logger.info('Padronização em lote concluída (BRASÍLIA)', { 
        totalProcessed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }, 'DB_BATCH_OPERATIONS');

      return createSuccessResponse({
        totalProcessed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        details: results
      });
    } catch (error) {
      logger.error('Erro na padronização em lote', { error }, 'DB_BATCH_OPERATIONS');
      return createErrorResponse(handleServiceError(error, 'STANDARDIZE_ALL_TIMES'));
    }
  }
}

export const batchOperationsService = new BatchOperationsService();


/**
 * SERVIÇO DE PADRONIZAÇÃO DE DATAS NO BANCO DE DADOS
 * 
 * Serviço principal que orquestra as operações de padronização de horários
 */

import { ApiResponse } from '@/types';
import { competitionAnalysisService } from './database-time-standardization/analysisService';
import { competitionStandardizationService } from './database-time-standardization/standardizationService';
import { triggerValidationService } from './database-time-standardization/triggerValidationService';
import { batchOperationsService } from './database-time-standardization/batchOperationsService';

export class DatabaseTimeStandardizationService {
  /**
   * Analisa todas as competições e identifica inconsistências de horário
   */
  async analyzeCompetitionTimeConsistency(): Promise<ApiResponse<any>> {
    return competitionAnalysisService.analyzeCompetitionTimeConsistency();
  }

  /**
   * Padroniza uma competição específica forçando atualização
   */
  async standardizeCompetitionTime(competitionId: string): Promise<ApiResponse<any>> {
    return competitionStandardizationService.standardizeCompetitionTime(competitionId);
  }

  /**
   * Padroniza todos os horários inconsistentes
   */
  async standardizeAllInconsistentTimes(): Promise<ApiResponse<any>> {
    return batchOperationsService.standardizeAllInconsistentTimes();
  }

  /**
   * Verifica se o sistema de triggers está funcionando corretamente
   */
  async validateTriggerSystem(): Promise<ApiResponse<any>> {
    return triggerValidationService.validateTriggerSystem();
  }
}

export const databaseTimeStandardizationService = new DatabaseTimeStandardizationService();


import { useState } from 'react';
import { dailyCompetitionCoreService } from '@/services/dailyCompetition/dailyCompetitionCore';
import { logger } from '@/utils/logger';

/**
 * Hook para debug e monitoramento do sistema de status automático
 */
export const useCompetitionStatusDebug = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<any>(null);

  const forceStatusUpdate = async () => {
    try {
      setIsUpdating(true);
      logger.info('🔧 Debug: Forçando atualização manual de status');
      
      const response = await dailyCompetitionCoreService.forceStatusUpdate();
      
      if (response.success) {
        setLastUpdate(response.data);
        logger.info('✅ Debug: Atualização forçada concluída', response.data);
      } else {
        logger.error('❌ Debug: Erro na atualização forçada', response.error);
      }
      
      return response;
    } catch (error) {
      logger.error('❌ Debug: Erro ao forçar atualização', error);
      return { success: false, error: 'Erro na atualização' };
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    forceStatusUpdate,
    isUpdating,
    lastUpdate
  };
};

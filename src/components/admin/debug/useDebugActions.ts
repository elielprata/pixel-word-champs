
import { useState } from 'react';
import { rankingDebugService } from '@/services/rankingDebugService';
import { cleanOrphanGameSessions, validateOrphanPrevention } from '@/utils/cleanOrphanSessions';
import { logger } from '@/utils/logger';

export const useDebugActions = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isValidatingProtection, setIsValidatingProtection] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [protectionResult, setProtectionResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckConsistency = async () => {
    setIsChecking(true);
    setError(null);
    try {
      logger.debug('Iniciando verificação de consistência do ranking', undefined, 'RANKING_DEBUG');
      const result = await rankingDebugService.checkDataConsistency();
      setLastResult(result);
      logger.debug('Verificação de consistência concluída', { result }, 'RANKING_DEBUG');
    } catch (err) {
      setError('Erro ao verificar consistência');
      logger.error('Erro ao verificar consistência do ranking', { error: err }, 'RANKING_DEBUG');
    } finally {
      setIsChecking(false);
    }
  };

  const handleForceUpdate = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      logger.debug('Iniciando atualização forçada do ranking', undefined, 'RANKING_DEBUG');
      await rankingDebugService.forceRankingUpdate();
      setTimeout(async () => {
        const result = await rankingDebugService.checkDataConsistency();
        setLastResult(result);
        logger.debug('Atualização forçada concluída', { result }, 'RANKING_DEBUG');
      }, 1500);
    } catch (err: any) {
      setError(`Erro ao atualizar ranking: ${err.message || 'Erro desconhecido'}`);
      logger.error('Erro ao forçar atualização do ranking', { error: err }, 'RANKING_DEBUG');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTestFunction = async () => {
    setIsTesting(true);
    setError(null);
    try {
      logger.debug('Iniciando teste direto da função', undefined, 'RANKING_DEBUG');
      const result = await rankingDebugService.testFunctionDirectly();
      logger.debug('Resultado do teste de função', { result }, 'RANKING_DEBUG');
      if (!result.success) {
        setError(`Erro no teste: ${result.error?.message || 'Erro desconhecido'}`);
        logger.error('Erro no teste da função', { error: result.error }, 'RANKING_DEBUG');
      }
    } catch (err: any) {
      setError(`Erro no teste: ${err.message || 'Erro desconhecido'}`);
      logger.error('Erro no teste de função do ranking', { error: err }, 'RANKING_DEBUG');
    } finally {
      setIsTesting(false);
    }
  };

  const handleValidateProtection = async () => {
    setIsValidatingProtection(true);
    setError(null);
    try {
      logger.debug('🔍 Validando sistema de proteção contra sessões órfãs', undefined, 'ORPHAN_PROTECTION');
      
      const validation = await validateOrphanPrevention();
      const cleanup = await cleanOrphanGameSessions();
      
      const combinedResult = {
        validation,
        cleanup,
        systemHealth: validation.isProtected && cleanup.triggerWorking !== false ? 'PROTEGIDO' : 'COMPROMETIDO',
        lastCleanupExecuted: new Date().toISOString()
      };
      
      setProtectionResult(combinedResult);
      
      if (!validation.isProtected || cleanup.triggerBypassed) {
        setError('⚠️ Sistema de proteção comprometido - sessões órfãs detectadas');
        logger.error('🚨 Sistema de proteção contra sessões órfãs comprometido', { combinedResult }, 'ORPHAN_PROTECTION');
      } else {
        logger.info('✅ Sistema de proteção funcionando corretamente', { combinedResult }, 'ORPHAN_PROTECTION');
      }
      
    } catch (err: any) {
      setError(`Erro na validação: ${err.message || 'Erro desconhecido'}`);
      logger.error('❌ Erro ao validar sistema de proteção', { error: err }, 'ORPHAN_PROTECTION');
    } finally {
      setIsValidatingProtection(false);
    }
  };

  return {
    isChecking,
    isUpdating,
    isTesting,
    isValidatingProtection,
    lastResult,
    protectionResult,
    error,
    handleCheckConsistency,
    handleForceUpdate,
    handleTestFunction,
    handleValidateProtection
  };
};

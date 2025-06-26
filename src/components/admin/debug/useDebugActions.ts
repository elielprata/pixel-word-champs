
import { useState } from 'react';
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
      logger.debug('Funcionalidade de verificação de consistência removida', undefined, 'RANKING_DEBUG');
      setLastResult({ message: 'Funcionalidade removida - diagnósticos desabilitados' });
    } catch (err) {
      setError('Funcionalidade não disponível');
      logger.error('Funcionalidade de diagnóstico removida', { error: err }, 'RANKING_DEBUG');
    } finally {
      setIsChecking(false);
    }
  };

  const handleForceUpdate = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      logger.debug('Funcionalidade de atualização forçada removida', undefined, 'RANKING_DEBUG');
      setLastResult({ message: 'Funcionalidade removida - diagnósticos desabilitados' });
    } catch (err: any) {
      setError(`Funcionalidade não disponível: ${err.message || 'Erro desconhecido'}`);
      logger.error('Funcionalidade de diagnóstico removida', { error: err }, 'RANKING_DEBUG');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTestFunction = async () => {
    setIsTesting(true);
    setError(null);
    try {
      logger.debug('Funcionalidade de teste removida', undefined, 'RANKING_DEBUG');
      setError('Funcionalidade removida - diagnósticos desabilitados');
    } catch (err: any) {
      setError(`Funcionalidade não disponível: ${err.message || 'Erro desconhecido'}`);
      logger.error('Funcionalidade de diagnóstico removida', { error: err }, 'RANKING_DEBUG');
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

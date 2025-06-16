
import { useState, useRef, useCallback } from 'react';
import { logger } from '@/utils/logger';

export const useSelectionLock = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedWordRef = useRef<string | null>(null);
  const lastProcessTimeRef = useRef<number>(0);

  const acquireLock = useCallback((word: string): boolean => {
    const now = Date.now();
    
    // Evitar processar a mesma palavra muito rapidamente (debounce de 500ms)
    if (lastProcessedWordRef.current === word && (now - lastProcessTimeRef.current) < 500) {
      logger.warn(`🔒 LOCK DENIED - Palavra "${word}" processada recentemente`, { 
        word, 
        timeSinceLastProcess: now - lastProcessTimeRef.current 
      }, 'SELECTION_LOCK');
      return false;
    }

    // Verificar se já está processando
    if (isProcessing) {
      logger.warn(`🔒 LOCK DENIED - Sistema já está processando uma palavra`, { 
        word, 
        currentlyProcessing: isProcessing 
      }, 'SELECTION_LOCK');
      return false;
    }

    // Adquirir lock
    setIsProcessing(true);
    lastProcessedWordRef.current = word;
    lastProcessTimeRef.current = now;
    
    logger.info(`🔓 LOCK ACQUIRED - Processando palavra "${word}"`, { word }, 'SELECTION_LOCK');
    
    // Auto-release do lock após 2 segundos (safety)
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }
    
    processingTimeoutRef.current = setTimeout(() => {
      logger.warn('⚠️ LOCK AUTO-RELEASE - Timeout de segurança ativado', { word }, 'SELECTION_LOCK');
      setIsProcessing(false);
    }, 2000);

    return true;
  }, [isProcessing]);

  const releaseLock = useCallback(() => {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    
    logger.info('🔓 LOCK RELEASED - Processamento concluído', {}, 'SELECTION_LOCK');
    setIsProcessing(false);
  }, []);

  return {
    isProcessing,
    acquireLock,
    releaseLock
  };
};

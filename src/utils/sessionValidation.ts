
import { logger } from '@/utils/logger';

export const validateSession = (session: any): boolean => {
  if (!session || !session.user) {
    return false;
  }
  
  // Validação básica da sessão
  if (!session.user.id || !session.access_token) {
    logger.warn('Sessão inválida: faltam dados obrigatórios', undefined, 'SESSION_VALIDATION');
    return false;
  }
  
  return true;
};

export const getSessionId = (session: any): string | null => {
  if (!session || !session.user) {
    return null;
  }
  return `${session.user.id}_${session.access_token?.substring(0, 10)}`;
};

export const shouldProcessSession = (
  sessionId: string | null,
  lastProcessedSessionRef: React.MutableRefObject<string | null>,
  isProcessingRef: React.MutableRefObject<boolean>,
  isMountedRef: React.MutableRefObject<boolean>
): boolean => {
  if (!isMountedRef.current) {
    logger.debug('Componente não montado, ignorando processamento', undefined, 'SESSION_VALIDATION');
    return false;
  }
  
  if (isProcessingRef.current) {
    logger.debug('Processamento já em andamento, ignorando', undefined, 'SESSION_VALIDATION');
    return false;
  }
  
  if (sessionId === lastProcessedSessionRef.current) {
    logger.debug('Sessão já processada, ignorando', undefined, 'SESSION_VALIDATION');
    return false;
  }
  
  return true;
};

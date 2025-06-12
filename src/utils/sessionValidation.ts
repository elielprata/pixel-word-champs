
import { logger } from '@/utils/logger';

export const validateSession = (session: any): boolean => {
  if (!session || !session.user) {
    logger.debug('Sessão inválida: sessão ou usuário não encontrados', undefined, 'SESSION_VALIDATION');
    return false;
  }
  
  // Validação básica da sessão
  if (!session.user.id || !session.access_token) {
    logger.warn('Sessão inválida: faltam dados obrigatórios', { 
      hasUserId: !!session.user.id,
      hasAccessToken: !!session.access_token 
    }, 'SESSION_VALIDATION');
    return false;
  }
  
  logger.debug('Sessão validada com sucesso', { userId: session.user.id }, 'SESSION_VALIDATION');
  return true;
};

export const getSessionId = (session: any): string | null => {
  if (!session || !session.user) {
    logger.debug('Não é possível gerar ID da sessão: sessão inválida', undefined, 'SESSION_VALIDATION');
    return null;
  }
  const sessionId = `${session.user.id}_${session.access_token?.substring(0, 10)}`;
  logger.debug('ID da sessão gerado', { sessionId }, 'SESSION_VALIDATION');
  return sessionId;
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
    logger.debug('Sessão já processada, ignorando', { sessionId }, 'SESSION_VALIDATION');
    return false;
  }
  
  logger.debug('Sessão deve ser processada', { sessionId }, 'SESSION_VALIDATION');
  return true;
};


import { useState, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface AdminCreationLock {
  isLocked: boolean;
  lockAdmin: (email: string) => Promise<boolean>;
  unlockAdmin: (email: string) => void;
  isEmailLocked: (email: string) => boolean;
}

// Cache global para controlar locks de criação
const creationLocks = new Set<string>();

export const useAdminCreationLock = (): AdminCreationLock => {
  const [isLocked, setIsLocked] = useState(false);

  const lockAdmin = useCallback(async (email: string): Promise<boolean> => {
    logger.debug('Tentando adquirir lock para criação de admin', { email }, 'ADMIN_CREATION_LOCK');
    
    // Verificar se já existe um lock para este email
    if (creationLocks.has(email)) {
      logger.warn('Email já está sendo processado', { email }, 'ADMIN_CREATION_LOCK');
      return false;
    }

    // Adquirir lock
    creationLocks.add(email);
    setIsLocked(true);
    
    logger.info('Lock adquirido com sucesso', { email }, 'ADMIN_CREATION_LOCK');
    return true;
  }, []);

  const unlockAdmin = useCallback((email: string) => {
    logger.debug('Liberando lock de criação de admin', { email }, 'ADMIN_CREATION_LOCK');
    
    creationLocks.delete(email);
    setIsLocked(false);
    
    logger.info('Lock liberado com sucesso', { email }, 'ADMIN_CREATION_LOCK');
  }, []);

  const isEmailLocked = useCallback((email: string): boolean => {
    return creationLocks.has(email);
  }, []);

  return {
    isLocked,
    lockAdmin,
    unlockAdmin,
    isEmailLocked
  };
};

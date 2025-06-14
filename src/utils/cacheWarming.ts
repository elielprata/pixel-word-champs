
import { warmWordsCache } from '@/hooks/useOptimizedWordSelection';
import { logger } from './logger';

// CACHE WARMING AUTOMÁTICO
export const initializeCacheWarming = () => {
  // Warm cache quando a aplicação carrega
  setTimeout(() => {
    warmWordsCache().catch(error => {
      logger.warn('⚠️ Erro no cache warming inicial', { error }, 'CACHE_WARMING');
    });
  }, 1000); // 1 segundo após carregar

  // Warm cache periodicamente (a cada 10 minutos)
  setInterval(() => {
    warmWordsCache().catch(error => {
      logger.warn('⚠️ Erro no cache warming periódico', { error }, 'CACHE_WARMING');
    });
  }, 10 * 60 * 1000); // 10 minutos
};

// PRÉ-AQUECIMENTO MANUAL (pode ser chamado na home)
export const preWarmCache = async (): Promise<boolean> => {
  try {
    await warmWordsCache();
    logger.info('✅ Cache pré-aquecido manualmente', undefined, 'CACHE_WARMING');
    return true;
  } catch (error) {
    logger.error('❌ Erro no pré-aquecimento manual', { error }, 'CACHE_WARMING');
    return false;
  }
};

// VERIFICAR STATUS DO CACHE
export const getCacheStatus = (): { isWarmed: boolean; age?: number } => {
  // Esta função será implementada quando exportarmos o status do cache
  // Por enquanto, retorna um status básico
  return { isWarmed: false };
};

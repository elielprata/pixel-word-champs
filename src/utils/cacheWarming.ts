
import { warmOptimizedCache } from '@/hooks/useOptimizedRandomWordSelection';
import { logger } from './logger';

// CACHE WARMING AUTOMÁTICO OTIMIZADO
export const initializeCacheWarming = () => {
  // Warm cache quando a aplicação carrega
  setTimeout(() => {
    warmOptimizedCache().catch(error => {
      logger.warn('⚠️ Erro no cache warming inicial otimizado', { error }, 'CACHE_WARMING');
    });
  }, 1000); // 1 segundo após carregar

  // Warm cache periodicamente (a cada 10 minutos)
  setInterval(() => {
    warmOptimizedCache().catch(error => {
      logger.warn('⚠️ Erro no cache warming periódico otimizado', { error }, 'CACHE_WARMING');
    });
  }, 10 * 60 * 1000); // 10 minutos
};

// PRÉ-AQUECIMENTO MANUAL OTIMIZADO
export const preWarmCache = async (): Promise<boolean> => {
  try {
    await warmOptimizedCache();
    logger.info('✅ Cache otimizado pré-aquecido manualmente', undefined, 'CACHE_WARMING');
    return true;
  } catch (error) {
    logger.error('❌ Erro no pré-aquecimento manual otimizado', { error }, 'CACHE_WARMING');
    return false;
  }
};

// VERIFICAR STATUS DO CACHE OTIMIZADO
export const getCacheStatus = (): { isWarmed: boolean; age?: number } => {
  // Esta função será implementada quando exportarmos o status do cache
  // Por enquanto, retorna um status básico
  return { isWarmed: false };
};

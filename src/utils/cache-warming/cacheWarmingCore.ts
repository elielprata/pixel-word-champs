
import { LocalWordCacheManager } from '../localWordCache';
import { warmHybridCache } from './cacheWarmingStrategies';
import { intelligentCacheWarming } from './cacheWarmingManagement';
import { logger } from '../logger';

export const initializeCacheWarmingCore = () => {
  // Inicializar cache local
  LocalWordCacheManager.initializeCache();
  
  // Warm cache híbrido inicial (mais rápido)
  setTimeout(() => {
    warmHybridCache().catch(error => {
      logger.warn('⚠️ Erro no cache warming híbrido inicial', { error }, 'CACHE_WARMING_UNIFIED');
    });
  }, 300); // Reduzido para 300ms

  // Warm cache periódico otimizado (a cada 8 minutos)
  setInterval(() => {
    warmHybridCache().catch(error => {
      logger.warn('⚠️ Erro no cache warming híbrido periódico', { error }, 'CACHE_WARMING_UNIFIED');
    });
  }, 8 * 60 * 1000); // 8 minutos

  // Limpeza otimizada (a cada 20 minutos)
  setInterval(() => {
    LocalWordCacheManager.cleanExpiredCache();
  }, 20 * 60 * 1000); // 20 minutos

  // Cache warming inteligente baseado em uso (a cada 4 minutos)
  setInterval(() => {
    intelligentCacheWarming().catch(error => {
      logger.warn('⚠️ Erro no cache warming inteligente', { error }, 'CACHE_WARMING_UNIFIED');
    });
  }, 4 * 60 * 1000); // 4 minutos
};

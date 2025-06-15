
import { logger } from './logger';
import { initializeCacheWarmingCore } from './cache-warming/cacheWarmingCore';
import { warmHybridCache, warmIntelligentCache } from './cache-warming/cacheWarmingStrategies';
import { intelligentCacheWarming, getCacheStatus, forceRefreshCache } from './cache-warming/cacheWarmingManagement';
import { getUnifiedSystemMetrics } from './cache-warming/cacheWarmingMetrics';

// SISTEMA DE CACHE WARMING UNIFICADO E OTIMIZADO
export const initializeCacheWarming = () => {
  initializeCacheWarmingCore();
};

// Exportar todas as funções do sistema
export {
  warmHybridCache,
  warmIntelligentCache,
  intelligentCacheWarming,
  getCacheStatus,
  forceRefreshCache,
  getUnifiedSystemMetrics
};

// PRÉ-AQUECIMENTO MANUAL UNIFICADO
export const preWarmCache = async (): Promise<boolean> => {
  try {
    const result = await warmHybridCache();
    logger.info('✅ Cache híbrido pré-aquecido manualmente', { success: result }, 'CACHE_WARMING_MANUAL');
    return result;
  } catch (error) {
    logger.error('❌ Erro no pré-aquecimento manual híbrido', { error }, 'CACHE_WARMING_MANUAL');
    return false;
  }
};

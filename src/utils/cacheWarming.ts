
import { IntelligentWordService } from '@/services/intelligentWordService';
import { LocalWordCacheManager } from './localWordCache';
import { logger } from './logger';

// CACHE WARMING INTELIGENTE
export const initializeCacheWarming = () => {
  // Inicializar cache local
  LocalWordCacheManager.initializeCache();
  
  // Warm cache inteligente quando a aplicação carrega
  setTimeout(() => {
    warmIntelligentCache().catch(error => {
      logger.warn('⚠️ Erro no cache warming inteligente inicial', { error }, 'CACHE_WARMING');
    });
  }, 1000); // 1 segundo após carregar

  // Warm cache periodicamente (a cada 15 minutos)
  setInterval(() => {
    warmIntelligentCache().catch(error => {
      logger.warn('⚠️ Erro no cache warming inteligente periódico', { error }, 'CACHE_WARMING');
    });
  }, 15 * 60 * 1000); // 15 minutos

  // Limpeza de cache expirado (a cada hora)
  setInterval(() => {
    LocalWordCacheManager.cleanExpiredCache();
  }, 60 * 60 * 1000); // 1 hora
};

// PRÉ-AQUECIMENTO INTELIGENTE
export const warmIntelligentCache = async (): Promise<boolean> => {
  try {
    logger.info('🔥 Iniciando cache warming inteligente', undefined, 'CACHE_WARMING');
    
    // Pré-carregar para diferentes tamanhos de palavra comuns
    const commonLengths = [6, 7, 8];
    
    for (const maxLength of commonLengths) {
      await IntelligentWordService.preloadCache(maxLength);
      
      // Pequeno delay entre pré-carregamentos
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    logger.info('✅ Cache warming inteligente concluído', { 
      lengths: commonLengths 
    }, 'CACHE_WARMING');
    
    return true;
  } catch (error) {
    logger.error('❌ Erro no cache warming inteligente', { error }, 'CACHE_WARMING');
    return false;
  }
};

// PRÉ-AQUECIMENTO MANUAL INTELIGENTE
export const preWarmCache = async (): Promise<boolean> => {
  try {
    await warmIntelligentCache();
    logger.info('✅ Cache inteligente pré-aquecido manualmente', undefined, 'CACHE_WARMING');
    return true;
  } catch (error) {
    logger.error('❌ Erro no pré-aquecimento manual inteligente', { error }, 'CACHE_WARMING');
    return false;
  }
};

// VERIFICAR STATUS DO CACHE INTELIGENTE
export const getCacheStatus = (): { 
  isWarmed: boolean; 
  age?: number; 
  stats: {
    totalEntries: number;
    totalWords: number;
    oldestEntry: number;
    newestEntry: number;
  };
} => {
  try {
    const stats = LocalWordCacheManager.getCacheStats();
    const age = stats.newestEntry > 0 ? 
      Math.round((Date.now() - stats.newestEntry) / (1000 * 60)) : undefined;
    
    return { 
      isWarmed: stats.totalWords > 0,
      age,
      stats
    };
  } catch (error) {
    logger.warn('⚠️ Erro ao verificar status do cache', { error }, 'CACHE_WARMING');
    return {
      isWarmed: false,
      stats: {
        totalEntries: 0,
        totalWords: 0,
        oldestEntry: 0,
        newestEntry: 0
      }
    };
  }
};

// FORÇA ATUALIZAÇÃO DO CACHE
export const forceRefreshCache = async (): Promise<boolean> => {
  try {
    logger.info('🔄 Forçando atualização do cache', undefined, 'CACHE_WARMING');
    
    // Limpar cache atual
    if (typeof window !== 'undefined') {
      localStorage.removeItem('word_cache_v2');
    }
    
    // Reinicializar e pré-aquecer
    LocalWordCacheManager.initializeCache();
    const result = await warmIntelligentCache();
    
    logger.info('✅ Cache forçadamente atualizado', { success: result }, 'CACHE_WARMING');
    return result;
  } catch (error) {
    logger.error('❌ Erro na atualização forçada do cache', { error }, 'CACHE_WARMING');
    return false;
  }
};

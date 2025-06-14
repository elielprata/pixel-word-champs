
import { IntelligentWordService } from '@/services/intelligentWordService';
import { LocalWordCacheManager } from './localWordCache';
import { logger } from './logger';

// CACHE WARMING INTELIGENTE OTIMIZADO
export const initializeCacheWarming = () => {
  // Inicializar cache local
  LocalWordCacheManager.initializeCache();
  
  // Warm cache inteligente quando a aplicação carrega (mais agressivo)
  setTimeout(() => {
    warmIntelligentCache().catch(error => {
      logger.warn('⚠️ Erro no cache warming inteligente inicial', { error }, 'CACHE_WARMING');
    });
  }, 500); // Reduzido para 500ms

  // Warm cache periodicamente (a cada 10 minutos em vez de 15)
  setInterval(() => {
    warmIntelligentCache().catch(error => {
      logger.warn('⚠️ Erro no cache warming inteligente periódico', { error }, 'CACHE_WARMING');
    });
  }, 10 * 60 * 1000); // 10 minutos

  // Limpeza de cache expirado (a cada 30 minutos em vez de 1 hora)
  setInterval(() => {
    LocalWordCacheManager.cleanExpiredCache();
  }, 30 * 60 * 1000); // 30 minutos

  // Cache warming adicional baseado em uso
  setInterval(() => {
    intelligentCacheWarming().catch(error => {
      logger.warn('⚠️ Erro no cache warming baseado em uso', { error }, 'CACHE_WARMING');
    });
  }, 5 * 60 * 1000); // 5 minutos
};

// PRÉ-AQUECIMENTO INTELIGENTE OTIMIZADO
export const warmIntelligentCache = async (): Promise<boolean> => {
  try {
    logger.info('🔥 Iniciando cache warming inteligente otimizado', undefined, 'CACHE_WARMING');
    
    // Pré-carregar para diferentes tamanhos de palavra comuns (expandido)
    const commonLengths = [5, 6, 7, 8, 9];
    const promises = [];
    
    for (const maxLength of commonLengths) {
      // Executar em paralelo para melhor performance
      promises.push(
        IntelligentWordService.preloadCache(maxLength).catch(error => {
          logger.warn(`⚠️ Erro no preload para length ${maxLength}`, { error }, 'CACHE_WARMING');
        })
      );
    }
    
    await Promise.allSettled(promises);
    
    logger.info('✅ Cache warming inteligente otimizado concluído', { 
      lengths: commonLengths 
    }, 'CACHE_WARMING');
    
    return true;
  } catch (error) {
    logger.error('❌ Erro no cache warming inteligente', { error }, 'CACHE_WARMING');
    return false;
  }
};

// CACHE WARMING BASEADO EM USO
export const intelligentCacheWarming = async (): Promise<boolean> => {
  try {
    const stats = getCacheStatus();
    
    // Se o cache está muito vazio, fazer warm mais agressivo
    if (stats.stats.totalWords < 50) {
      logger.info('🔥 Cache warming agressivo - cache com poucas palavras', { 
        totalWords: stats.stats.totalWords 
      }, 'CACHE_WARMING');
      
      return await warmIntelligentCache();
    }
    
    // Se o cache é antigo, renovar gradualmente
    if (stats.age && stats.age > 30) { // 30 minutos
      logger.info('🔄 Cache warming gradual - cache antigo', { 
        age: stats.age 
      }, 'CACHE_WARMING');
      
      // Renovar apenas um tamanho por vez
      const targetLength = Math.floor(Math.random() * 5) + 5; // 5-9
      await IntelligentWordService.preloadCache(targetLength);
      return true;
    }
    
    return true;
  } catch (error) {
    logger.error('❌ Erro no cache warming baseado em uso', { error }, 'CACHE_WARMING');
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

// VERIFICAR STATUS DO CACHE INTELIGENTE MELHORADO
export const getCacheStatus = (): { 
  isWarmed: boolean; 
  age?: number; 
  stats: {
    totalEntries: number;
    totalWords: number;
    oldestEntry: number;
    newestEntry: number;
  };
  health: 'excellent' | 'good' | 'poor' | 'critical';
  recommendations: string[];
} => {
  try {
    const stats = LocalWordCacheManager.getCacheStats();
    const age = stats.newestEntry > 0 ? 
      Math.round((Date.now() - stats.newestEntry) / (1000 * 60)) : undefined;
    
    // Avaliar saúde do cache
    let health: 'excellent' | 'good' | 'poor' | 'critical' = 'critical';
    const recommendations: string[] = [];
    
    if (stats.totalWords >= 100) {
      health = 'excellent';
    } else if (stats.totalWords >= 50) {
      health = 'good';
      recommendations.push('Considere fazer warm cache para mais palavras');
    } else if (stats.totalWords >= 20) {
      health = 'poor';
      recommendations.push('Cache com poucas palavras - recomenda warm cache');
    } else {
      health = 'critical';
      recommendations.push('Cache crítico - execute warm cache imediatamente');
    }
    
    if (age && age > 60) {
      recommendations.push('Cache muito antigo - considere refresh');
    }
    
    return { 
      isWarmed: stats.totalWords > 0,
      age,
      stats,
      health,
      recommendations
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
      },
      health: 'critical',
      recommendations: ['Erro ao verificar cache - reinicialize o sistema']
    };
  }
};

// FORÇA ATUALIZAÇÃO DO CACHE MELHORADA
export const forceRefreshCache = async (): Promise<boolean> => {
  try {
    logger.info('🔄 Forçando atualização completa do cache', undefined, 'CACHE_WARMING');
    
    // Limpar cache atual
    if (typeof window !== 'undefined') {
      localStorage.removeItem('word_cache_v2');
    }
    
    // Reinicializar e pré-aquecer de forma mais robusta
    LocalWordCacheManager.initializeCache();
    const result = await warmIntelligentCache();
    
    // Verificar se realmente funcionou
    const newStatus = getCacheStatus();
    const success = result && newStatus.stats.totalWords > 0;
    
    logger.info('✅ Cache forçadamente atualizado', { 
      success, 
      newTotalWords: newStatus.stats.totalWords,
      health: newStatus.health
    }, 'CACHE_WARMING');
    
    return success;
  } catch (error) {
    logger.error('❌ Erro na atualização forçada do cache', { error }, 'CACHE_WARMING');
    return false;
  }
};

// MÉTRICAS AVANÇADAS DO SISTEMA
export const getSystemMetrics = () => {
  const cacheStatus = getCacheStatus();
  
  return {
    cache: cacheStatus,
    performance: {
      uptime: performance.now(),
      memory: (performance as any).memory ? {
        used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
      } : null
    },
    timestamp: new Date().toISOString()
  };
};

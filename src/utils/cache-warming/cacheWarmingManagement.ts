
import { LocalWordCacheManager } from '../localWordCache';
import { warmHybridCache } from './cacheWarmingStrategies';
import { logger } from '../logger';

// CACHE WARMING ADAPTATIVO BASEADO EM USO
export const intelligentCacheWarming = async (): Promise<boolean> => {
  try {
    const status = getCacheStatus();
    
    // Estratégia adaptativa baseada na saúde do cache
    if (status.health === 'critical' || status.stats.totalWords < 30) {
      logger.info('🔥 Cache warming agressivo - estado crítico', { 
        health: status.health,
        totalWords: status.stats.totalWords 
      }, 'CACHE_WARMING_ADAPTIVE');
      
      return await warmHybridCache();
    }
    
    if (status.health === 'poor' || (status.age && status.age > 25)) {
      logger.info('🔄 Cache warming gradual - estado pobre/antigo', { 
        health: status.health,
        age: status.age 
      }, 'CACHE_WARMING_ADAPTIVE');
      
      // Renovar apenas um tamanho específico
      const targetLength = 6 + Math.floor(Math.random() * 3); // 6-8
      // await IntelligentWordService.preloadCache(targetLength);
      return true;
    }
    
    // Cache saudável - apenas manutenção leve
    if (status.health === 'good') {
      logger.debug('💚 Cache saudável - manutenção leve', { 
        health: status.health 
      }, 'CACHE_WARMING_ADAPTIVE');
      
      // Limpeza suave sem recarregamento
      LocalWordCacheManager.cleanExpiredCache();
    }
    
    return true;
  } catch (error) {
    logger.error('❌ Erro no cache warming adaptativo', { error }, 'CACHE_WARMING_ADAPTIVE');
    return false;
  }
};

// VERIFICAR STATUS DO CACHE UNIFICADO
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
  efficiency: number;
} => {
  try {
    const detailedStats = LocalWordCacheManager.getDetailedMetrics();
    const age = detailedStats.newestEntry > 0 ? 
      Math.round((Date.now() - detailedStats.newestEntry) / (1000 * 60)) : undefined;
    
    // Avaliação de saúde mais rigorosa
    let health: 'excellent' | 'good' | 'poor' | 'critical' = 'critical';
    const recommendations: string[] = [];
    
    if (detailedStats.totalWords >= 80 && detailedStats.efficiency >= 70) {
      health = 'excellent';
    } else if (detailedStats.totalWords >= 50 && detailedStats.efficiency >= 50) {
      health = 'good';
      recommendations.push('Cache funcionando bem');
    } else if (detailedStats.totalWords >= 25) {
      health = 'poor';
      recommendations.push('Cache com poucas palavras - warm recomendado');
    } else {
      health = 'critical';
      recommendations.push('Cache crítico - warm urgente necessário');
    }
    
    if (age && age > 45) {
      recommendations.push('Cache muito antigo - refresh recomendado');
    }
    
    if (detailedStats.efficiency < 40) {
      recommendations.push('Baixa eficiência de cache - otimização necessária');
    }
    
    return { 
      isWarmed: detailedStats.totalWords > 0,
      age,
      stats: {
        totalEntries: detailedStats.totalEntries,
        totalWords: detailedStats.totalWords,
        oldestEntry: detailedStats.oldestEntry,
        newestEntry: detailedStats.newestEntry
      },
      health,
      recommendations,
      efficiency: detailedStats.efficiency
    };
  } catch (error) {
    logger.warn('⚠️ Erro ao verificar status do cache unificado', { error }, 'CACHE_WARMING_STATUS');
    return {
      isWarmed: false,
      stats: {
        totalEntries: 0,
        totalWords: 0,
        oldestEntry: 0,
        newestEntry: 0
      },
      health: 'critical',
      recommendations: ['Erro ao verificar cache - reinicialize o sistema'],
      efficiency: 0
    };
  }
};

// FORÇA ATUALIZAÇÃO COMPLETA DO SISTEMA
export const forceRefreshCache = async (): Promise<boolean> => {
  try {
    logger.info('🔄 Forçando atualização completa do sistema de cache', undefined, 'CACHE_WARMING_FORCE_REFRESH');
    
    // Limpar todos os caches
    if (typeof window !== 'undefined') {
      localStorage.removeItem('word_cache_v2');
    }
    
    // Reinicializar sistema
    LocalWordCacheManager.initializeCache();
    
    // Warm híbrido completo
    const result = await warmHybridCache();
    
    // Verificar resultado
    const newStatus = getCacheStatus();
    const success = result && newStatus.stats.totalWords > 0;
    
    logger.info('✅ Sistema de cache completamente atualizado', { 
      success, 
      newTotalWords: newStatus.stats.totalWords,
      health: newStatus.health,
      efficiency: newStatus.efficiency
    }, 'CACHE_WARMING_FORCE_REFRESH');
    
    return success;
  } catch (error) {
    logger.error('❌ Erro na atualização forçada do sistema', { error }, 'CACHE_WARMING_FORCE_REFRESH');
    return false;
  }
};

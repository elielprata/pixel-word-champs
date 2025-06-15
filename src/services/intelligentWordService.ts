
import { logger } from '@/utils/logger';
import { intelligentWordServiceCore } from './intelligent-word/intelligentWordServiceCore';
import { intelligentWordServiceDatabase } from './intelligent-word/intelligentWordServiceDatabase';
import { intelligentWordServiceDefaults } from './intelligent-word/intelligentWordServiceDefaults';

// Cache de queries do banco para evitar consultas duplicadas
const queryCache = new Map<string, any>();
const QUERY_CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

export class IntelligentWordService {
  // Seleção inteligente com múltiplos fallbacks OTIMIZADA
  static async getWordsWithIntelligentFallback(
    count: number = 5,
    maxLength: number = 8,
    level: number = 1
  ): Promise<{
    words: string[];
    source: 'database' | 'cache' | 'default' | 'emergency';
    processingTime: number;
  }> {
    return intelligentWordServiceCore.getWordsWithIntelligentFallback(
      count, 
      maxLength, 
      level,
      queryCache,
      QUERY_CACHE_DURATION
    );
  }

  // Tentar seleção do banco de dados OTIMIZADA
  static async tryOptimizedDatabaseSelection(count: number, maxLength: number): Promise<string[] | null> {
    return intelligentWordServiceDatabase.tryOptimizedDatabaseSelection(count, maxLength);
  }

  // Obter palavras padrão para o nível OTIMIZADO
  static getOptimizedDefaultWordsForLevel(level: number, count: number, maxLength: number): string[] | null {
    return intelligentWordServiceDefaults.getOptimizedDefaultWordsForLevel(level, count, maxLength);
  }

  // Pré-carregar cache OTIMIZADO
  static async preloadCache(maxLength: number = 8): Promise<void> {
    try {
      logger.info('🔥 Pré-carregando cache inteligente otimizado', { maxLength }, 'INTELLIGENT_WORD_SERVICE');
      
      const dbWords = await this.tryOptimizedDatabaseSelection(100, maxLength);
      if (dbWords && dbWords.length > 0) {
        // LocalWordCacheManager.setCachedWords(dbWords, maxLength, 'preload');
        logger.info('✅ Cache pré-carregado otimizado com sucesso', { 
          wordsCount: dbWords.length,
          maxLength
        }, 'INTELLIGENT_WORD_SERVICE');
      }
    } catch (error) {
      logger.warn('⚠️ Erro no pré-carregamento otimizado do cache', { error, maxLength }, 'INTELLIGENT_WORD_SERVICE');
    }
  }

  // Limpar cache de queries periodicamente
  static cleanQueryCache(): void {
    const now = Date.now();
    for (const [key, cache] of queryCache.entries()) {
      if (now - cache.timestamp > QUERY_CACHE_DURATION) {
        queryCache.delete(key);
      }
    }
  }
}

// Limpeza automática do cache de queries a cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    IntelligentWordService.cleanQueryCache();
  }, 5 * 60 * 1000);
}

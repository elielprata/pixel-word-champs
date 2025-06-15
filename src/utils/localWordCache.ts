
import { logger } from './logger';

// Cache simples em memória
let wordCache: string[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export class LocalWordCacheManager {
  // Obter palavras do cache
  static getCachedWords(maxLength: number, count: number = 5): string[] | null {
    if (!this.isValidCache()) {
      return null;
    }
    
    const validWords = wordCache
      .filter(word => word.length <= maxLength && word.length >= 3)
      .slice(0, count);
    
    return validWords.length >= count ? validWords : null;
  }

  // Armazenar palavras no cache
  static setCachedWords(words: string[]): void {
    if (words && words.length > 0) {
      wordCache = [...words];
      cacheTimestamp = Date.now();
      logger.info(`📦 Cache atualizado: ${words.length} palavras`, undefined, 'LOCAL_CACHE');
    }
  }

  // Palavras de emergência
  static getEmergencyFallback(count: number = 5): string[] {
    const emergency = ['CASA', 'AMOR', 'VIDA', 'TEMPO', 'MUNDO', 'FORMA', 'PARTE'];
    return emergency.slice(0, count);
  }

  // Verificar se cache é válido
  static isValidCache(): boolean {
    return wordCache.length > 0 && Date.now() - cacheTimestamp < CACHE_DURATION;
  }

  // Limpar cache
  static clearCache(): void {
    wordCache = [];
    cacheTimestamp = 0;
    logger.info('🗑️ Cache limpo', undefined, 'LOCAL_CACHE');
  }

  // Estatísticas básicas
  static getCacheStats() {
    return {
      totalWords: wordCache.length,
      cacheAge: cacheTimestamp > 0 ? Date.now() - cacheTimestamp : 0,
      isValid: this.isValidCache()
    };
  }

  // Métodos de compatibilidade (vazios para manter interface)
  static initializeCache(): void {
    logger.info('Cache inicializado (modo simples)', undefined, 'LOCAL_CACHE');
  }

  static cleanExpiredCache(): void {
    if (!this.isValidCache()) {
      this.clearCache();
    }
  }

  static getDetailedMetrics() {
    return {
      ...this.getCacheStats(),
      hitRate: 0,
      missRate: 0,
      avgResponseTime: 0
    };
  }
}

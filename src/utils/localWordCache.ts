
import { logger } from './logger';

// Cache simples em memória
let simpleCache: string[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

export class LocalWordCacheManager {
  // Obter palavras do cache simples
  static getCachedWords(maxLength: number, count: number = 5): string[] | null {
    if (!simpleCache.length || Date.now() - cacheTimestamp > CACHE_DURATION) {
      return null;
    }
    
    const validWords = simpleCache.filter(word => word.length <= maxLength);
    return validWords.slice(0, count);
  }

  // Armazenar palavras no cache simples
  static setCachedWords(words: string[]): void {
    if (words && words.length > 0) {
      simpleCache = [...words];
      cacheTimestamp = Date.now();
    }
  }

  // Fallback de emergência simples
  static getEmergencyFallback(count: number = 5): string[] {
    const emergencyWords = ['CASA', 'AMOR', 'VIDA', 'TEMPO', 'MUNDO', 'FORMA', 'PARTE'];
    return emergencyWords.slice(0, count);
  }

  // Estatísticas básicas
  static getCacheStats() {
    return {
      totalWords: simpleCache.length,
      cacheAge: cacheTimestamp > 0 ? Date.now() - cacheTimestamp : 0,
      isValid: simpleCache.length > 0 && Date.now() - cacheTimestamp < CACHE_DURATION
    };
  }

  // Limpar cache
  static clearCache(): void {
    simpleCache = [];
    cacheTimestamp = 0;
  }
}

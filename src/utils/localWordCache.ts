
import { normalizeText, isValidGameWord } from './levelConfiguration';
import { logger } from './logger';
import { localWordCacheCore } from './local-word-cache/localWordCacheCore';
import { localWordCacheMetrics } from './local-word-cache/localWordCacheMetrics';
import { localWordCacheEmergency } from './local-word-cache/localWordCacheEmergency';

interface CachedWordData {
  words: string[];
  timestamp: number;
  version: string;
  difficulty: string;
  category: string;
  hits: number;
  lastAccessed: number;
}

interface LocalWordCache {
  [key: string]: CachedWordData;
}

const CACHE_VERSION = '2.1';
const CACHE_DURATION = 30 * 60 * 1000;
const CACHE_KEY = 'word_cache_v2';
const MAX_CACHE_ENTRIES = 20;

export class LocalWordCacheManager {
  private static cache: LocalWordCache | null = null;
  private static metrics = {
    hits: 0,
    misses: 0,
    writes: 0,
    cleans: 0
  };

  // Inicializar cache local OTIMIZADO
  static initializeCache(): void {
    localWordCacheCore.initializeCache(this.cache, CACHE_VERSION, CACHE_KEY);
  }

  // Obter palavras do cache local OTIMIZADO
  static getCachedWords(maxLength: number, count: number = 5, difficulty?: string): string[] | null {
    return localWordCacheCore.getCachedWords(
      this.cache,
      this.metrics,
      maxLength,
      count,
      difficulty,
      CACHE_VERSION,
      CACHE_DURATION,
      () => this.saveCache()
    );
  }

  // Armazenar palavras no cache local OTIMIZADO
  static setCachedWords(words: string[], maxLength: number, difficulty: string = 'mixed'): void {
    localWordCacheCore.setCachedWords(
      this.cache,
      words,
      maxLength,
      difficulty,
      CACHE_VERSION,
      MAX_CACHE_ENTRIES,
      () => this.saveCache()
    );
  }

  // Limpar cache expirado OTIMIZADO
  static cleanExpiredCache(): void {
    localWordCacheCore.cleanExpiredCache(
      this.cache,
      this.metrics,
      CACHE_VERSION,
      CACHE_DURATION,
      () => this.saveCache()
    );
  }

  // Obter estatísticas do cache MELHORADAS
  static getCacheStats() {
    return localWordCacheMetrics.getCacheStats(this.cache, this.metrics);
  }

  // Obter métricas detalhadas
  static getDetailedMetrics() {
    return localWordCacheMetrics.getDetailedMetrics(this.cache, this.metrics, MAX_CACHE_ENTRIES);
  }

  // Fallback de emergência com palavras hardcoded EXPANDIDO
  static getEmergencyFallback(count: number = 5): string[] {
    return localWordCacheEmergency.getEmergencyFallback(count);
  }

  // Salvar cache no localStorage OTIMIZADO
  private static saveCache(): void {
    localWordCacheCore.saveCache(this.cache, this.metrics, CACHE_KEY, MAX_CACHE_ENTRIES);
  }
}

// Inicializar cache na importação
if (typeof window !== 'undefined') {
  LocalWordCacheManager.initializeCache();
  
  // Limpeza periódica otimizada
  setInterval(() => {
    LocalWordCacheManager.cleanExpiredCache();
  }, 30 * 60 * 1000); // a cada 30 minutos
}

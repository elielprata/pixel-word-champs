
import { normalizeText, isValidGameWord } from '../levelConfiguration';
import { logger } from '../logger';

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

export const localWordCacheCore = {
  initializeCache(cache: LocalWordCache | null, CACHE_VERSION: string, CACHE_KEY: string): LocalWordCache | null {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        cache = JSON.parse(stored);
        
        const entries = Object.values(cache || {});
        const hasOldVersion = entries.some(entry => entry.version !== CACHE_VERSION);
        
        if (hasOl dVersion) {
          logger.info('🔄 Atualizando versão do cache local', { 
            oldEntries: entries.length 
          }, 'LOCAL_CACHE');
          cache = {};
        }
        
        logger.info('💾 Cache local otimizado carregado', { 
          keys: Object.keys(cache || {}).length,
          version: CACHE_VERSION
        }, 'LOCAL_CACHE');
      } else {
        cache = {};
        logger.info('💾 Cache local otimizado inicializado', undefined, 'LOCAL_CACHE');
      }
    } catch (error) {
      logger.warn('⚠️ Erro ao carregar cache local - reinicializando', { error }, 'LOCAL_CACHE');
      cache = {};
    }
    return cache;
  },

  getCachedWords(
    cache: LocalWordCache | null,
    metrics: any,
    maxLength: number,
    count: number,
    difficulty: string | undefined,
    CACHE_VERSION: string,
    CACHE_DURATION: number,
    saveCache: () => void
  ): string[] | null {
    if (!cache) return null;
    
    const cacheKey = this.generateCacheKey(maxLength, difficulty);
    const cacheData = cache[cacheKey];
    
    if (!cacheData || !this.isCacheValid(cacheData, CACHE_VERSION, CACHE_DURATION)) {
      metrics.misses++;
      return null;
    }
    
    cacheData.hits++;
    cacheData.lastAccessed = Date.now();
    metrics.hits++;
    
    const available = cacheData.words.filter(word => 
      word && word.length <= maxLength && word.length >= 3
    );
    
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    
    saveCache();
    return selected;
  },

  setCachedWords(
    cache: LocalWordCache | null,
    words: string[],
    maxLength: number,
    difficulty: string,
    CACHE_VERSION: string,
    MAX_CACHE_ENTRIES: number,
    saveCache: () => void
  ): void {
    if (!cache) cache = {};
    if (!words || words.length === 0) return;
    
    const validWords = words
      .map(word => normalizeText(word))
      .filter(word => word && typeof word === 'string')
      .filter(word => isValidGameWord(word, maxLength))
      .filter(word => word.length >= 3 && word.length <= maxLength)
      .filter((word, index, array) => array.indexOf(word) === index);
    
    if (validWords.length === 0) return;
    
    const cacheKey = this.generateCacheKey(maxLength, difficulty);
    const now = Date.now();
    
    const cacheData: CachedWordData = {
      words: validWords,
      timestamp: now,
      version: CACHE_VERSION,
      difficulty: difficulty,
      category: 'geral',
      hits: 0,
      lastAccessed: now
    };
    
    cache[cacheKey] = cacheData;
    saveCache();
  },

  cleanExpiredCache(
    cache: LocalWordCache | null,
    metrics: any,
    CACHE_VERSION: string,
    CACHE_DURATION: number,
    saveCache: () => void
  ): void {
    if (!cache) return;
    
    let cleanedCount = 0;
    
    for (const [key, data] of Object.entries(cache)) {
      if (!this.isCacheValid(data, CACHE_VERSION, CACHE_DURATION)) {
        delete cache[key];
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      metrics.cleans++;
      saveCache();
    }
  },

  saveCache(
    cache: LocalWordCache | null,
    metrics: any,
    CACHE_KEY: string,
    MAX_CACHE_ENTRIES: number
  ): void {
    try {
      if (cache) {
        this.limitCacheSize(cache, MAX_CACHE_ENTRIES);
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        metrics.writes++;
      }
    } catch (error) {
      logger.warn('⚠️ Erro ao salvar cache local otimizado', { error }, 'LOCAL_CACHE');
    }
  },

  private generateCacheKey(maxLength: number, difficulty?: string): string {
    return `words_${maxLength}_${difficulty || 'any'}`;
  },

  private isCacheValid(cacheData: CachedWordData, CACHE_VERSION: string, CACHE_DURATION: number): boolean {
    if (!cacheData) return false;
    
    const age = Date.now() - cacheData.timestamp;
    const isExpired = age > CACHE_DURATION;
    const isValidVersion = cacheData.version === CACHE_VERSION;
    const hasWords = cacheData.words && cacheData.words.length > 0;
    
    return !isExpired && isValidVersion && hasWords;
  },

  private limitCacheSize(cache: LocalWordCache, MAX_CACHE_ENTRIES: number): void {
    const entries = Object.entries(cache);
    if (entries.length <= MAX_CACHE_ENTRIES) return;
    
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    const toRemove = entries.length - MAX_CACHE_ENTRIES;
    for (let i = 0; i < toRemove; i++) {
      delete cache[entries[i][0]];
    }
  }
};

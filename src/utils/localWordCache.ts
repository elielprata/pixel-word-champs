
import { normalizeText, isValidGameWord } from './levelConfiguration';
import { logger } from './logger';

interface CachedWordData {
  words: string[];
  timestamp: number;
  version: string;
  difficulty: string;
  category: string;
}

interface LocalWordCache {
  [key: string]: CachedWordData;
}

const CACHE_VERSION = '2.0';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
const CACHE_KEY = 'word_cache_v2';

export class LocalWordCacheManager {
  private static cache: LocalWordCache | null = null;

  // Inicializar cache local
  static initializeCache(): void {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        this.cache = JSON.parse(stored);
        logger.info('💾 Cache local carregado', { 
          keys: Object.keys(this.cache || {}).length 
        }, 'LOCAL_CACHE');
      } else {
        this.cache = {};
        logger.info('💾 Cache local inicializado', undefined, 'LOCAL_CACHE');
      }
    } catch (error) {
      logger.warn('⚠️ Erro ao carregar cache local', { error }, 'LOCAL_CACHE');
      this.cache = {};
    }
  }

  // Salvar cache no localStorage
  private static saveCache(): void {
    try {
      if (this.cache) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
        logger.debug('💾 Cache local salvo', { 
          keys: Object.keys(this.cache).length 
        }, 'LOCAL_CACHE');
      }
    } catch (error) {
      logger.warn('⚠️ Erro ao salvar cache local', { error }, 'LOCAL_CACHE');
    }
  }

  // Gerar chave de cache inteligente
  private static generateCacheKey(maxLength: number, difficulty?: string): string {
    return `words_${maxLength}_${difficulty || 'any'}`;
  }

  // Verificar se cache é válido
  private static isCacheValid(cacheData: CachedWordData): boolean {
    if (!cacheData) return false;
    
    const age = Date.now() - cacheData.timestamp;
    const isExpired = age > CACHE_DURATION;
    const isValidVersion = cacheData.version === CACHE_VERSION;
    
    return !isExpired && isValidVersion && cacheData.words.length > 0;
  }

  // Obter palavras do cache local
  static getCachedWords(maxLength: number, count: number = 5, difficulty?: string): string[] | null {
    if (!this.cache) this.initializeCache();
    
    const cacheKey = this.generateCacheKey(maxLength, difficulty);
    const cacheData = this.cache?.[cacheKey];
    
    if (!cacheData || !this.isCacheValid(cacheData)) {
      logger.debug('💾 Cache miss ou inválido', { 
        cacheKey, 
        exists: !!cacheData,
        valid: cacheData ? this.isCacheValid(cacheData) : false
      }, 'LOCAL_CACHE');
      return null;
    }
    
    // Seleção aleatória das palavras cackeadas
    const shuffled = [...cacheData.words].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    
    logger.info('✅ Palavras obtidas do cache local', { 
      cacheKey,
      available: cacheData.words.length,
      selected: selected.length,
      age: Math.round((Date.now() - cacheData.timestamp) / (1000 * 60))
    }, 'LOCAL_CACHE');
    
    return selected;
  }

  // Armazenar palavras no cache local
  static setCachedWords(
    words: string[], 
    maxLength: number, 
    difficulty: string = 'mixed'
  ): void {
    if (!this.cache) this.initializeCache();
    if (!words || words.length === 0) return;
    
    // Filtrar e validar palavras
    const validWords = words
      .map(word => normalizeText(word))
      .filter(word => isValidGameWord(word, maxLength))
      .filter((word, index, array) => array.indexOf(word) === index); // remover duplicatas
    
    if (validWords.length === 0) {
      logger.warn('⚠️ Nenhuma palavra válida para cache', { 
        originalCount: words.length,
        maxLength 
      }, 'LOCAL_CACHE');
      return;
    }
    
    const cacheKey = this.generateCacheKey(maxLength, difficulty);
    const cacheData: CachedWordData = {
      words: validWords,
      timestamp: Date.now(),
      version: CACHE_VERSION,
      difficulty: difficulty,
      category: 'geral'
    };
    
    if (!this.cache) this.cache = {};
    this.cache[cacheKey] = cacheData;
    this.saveCache();
    
    logger.info('💾 Palavras armazenadas no cache local', { 
      cacheKey,
      wordsCount: validWords.length,
      maxLength,
      difficulty
    }, 'LOCAL_CACHE');
  }

  // Limpar cache expirado
  static cleanExpiredCache(): void {
    if (!this.cache) return;
    
    let cleanedCount = 0;
    const now = Date.now();
    
    for (const [key, data] of Object.entries(this.cache)) {
      if (!this.isCacheValid(data)) {
        delete this.cache[key];
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      this.saveCache();
      logger.info('🧹 Cache local limpo', { 
        removedEntries: cleanedCount 
      }, 'LOCAL_CACHE');
    }
  }

  // Obter estatísticas do cache
  static getCacheStats(): { 
    totalEntries: number; 
    totalWords: number; 
    oldestEntry: number; 
    newestEntry: number; 
  } {
    if (!this.cache) this.initializeCache();
    
    const entries = Object.values(this.cache || {});
    const totalWords = entries.reduce((sum, entry) => sum + entry.words.length, 0);
    const timestamps = entries.map(entry => entry.timestamp);
    
    return {
      totalEntries: entries.length,
      totalWords,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0
    };
  }

  // Fallback de emergência com palavras hardcoded
  static getEmergencyFallback(count: number = 5): string[] {
    const emergencyWords = [
      'CASA', 'AMOR', 'VIDA', 'TEMPO', 'MUNDO', 'PESSOA', 'LUGAR', 'FORMA',
      'PARTE', 'GRUPO', 'PROBLEMA', 'PROGRAMA', 'SISTEMA', 'GOVERNO', 'EMPRESA',
      'TRABALHO', 'PROCESSO', 'PROJETO', 'PRODUTO', 'SERVIÇO', 'MOMENTO', 'ESTADO',
      'CIDADE', 'PAIS', 'ANOS', 'CASO', 'TIPO', 'MODO', 'MEIO', 'EXEMPLO'
    ];
    
    const shuffled = [...emergencyWords].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    
    logger.warn('🆘 Usando fallback de emergência', { 
      selected: selected.length 
    }, 'LOCAL_CACHE');
    
    return selected;
  }
}

// Inicializar cache na importação
if (typeof window !== 'undefined') {
  LocalWordCacheManager.initializeCache();
  
  // Limpeza periódica do cache
  setInterval(() => {
    LocalWordCacheManager.cleanExpiredCache();
  }, 60 * 60 * 1000); // a cada hora
}

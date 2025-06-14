
import { normalizeText, isValidGameWord } from './levelConfiguration';
import { logger } from './logger';

interface CachedWordData {
  words: string[];
  timestamp: number;
  version: string;
  difficulty: string;
  category: string;
  hits: number; // Contador de acessos
  lastAccessed: number; // Último acesso
}

interface LocalWordCache {
  [key: string]: CachedWordData;
}

const CACHE_VERSION = '2.1'; // Incrementado para nova versão otimizada
const CACHE_DURATION = 30 * 60 * 1000; // Aumentado para 30 minutos
const CACHE_KEY = 'word_cache_v2';
const MAX_CACHE_ENTRIES = 20; // Limite de entradas no cache

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
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        this.cache = JSON.parse(stored);
        
        // Validar versão do cache
        const entries = Object.values(this.cache || {});
        const hasOldVersion = entries.some(entry => entry.version !== CACHE_VERSION);
        
        if (hasOldVersion) {
          logger.info('🔄 Atualizando versão do cache local', { 
            oldEntries: entries.length 
          }, 'LOCAL_CACHE');
          this.cache = {}; // Reset para nova versão
        }
        
        logger.info('💾 Cache local otimizado carregado', { 
          keys: Object.keys(this.cache || {}).length,
          version: CACHE_VERSION
        }, 'LOCAL_CACHE');
      } else {
        this.cache = {};
        logger.info('💾 Cache local otimizado inicializado', undefined, 'LOCAL_CACHE');
      }
    } catch (error) {
      logger.warn('⚠️ Erro ao carregar cache local - reinicializando', { error }, 'LOCAL_CACHE');
      this.cache = {};
    }
  }

  // Salvar cache no localStorage OTIMIZADO
  private static saveCache(): void {
    try {
      if (this.cache) {
        // Limitar tamanho do cache antes de salvar
        this.limitCacheSize();
        
        localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
        this.metrics.writes++;
        
        logger.debug('💾 Cache local otimizado salvo', { 
          keys: Object.keys(this.cache).length,
          writes: this.metrics.writes
        }, 'LOCAL_CACHE');
      }
    } catch (error) {
      logger.warn('⚠️ Erro ao salvar cache local otimizado', { error }, 'LOCAL_CACHE');
    }
  }

  // Limitar tamanho do cache
  private static limitCacheSize(): void {
    if (!this.cache) return;
    
    const entries = Object.entries(this.cache);
    if (entries.length <= MAX_CACHE_ENTRIES) return;
    
    // Ordenar por último acesso (menos acessados primeiro)
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Remover entradas mais antigas
    const toRemove = entries.length - MAX_CACHE_ENTRIES;
    for (let i = 0; i < toRemove; i++) {
      delete this.cache[entries[i][0]];
    }
    
    logger.info('🧹 Cache limitado por tamanho', { 
      removed: toRemove,
      remaining: Object.keys(this.cache).length
    }, 'LOCAL_CACHE');
  }

  // Gerar chave de cache inteligente MELHORADA
  private static generateCacheKey(maxLength: number, difficulty?: string): string {
    return `words_${maxLength}_${difficulty || 'any'}`;
  }

  // Verificar se cache é válido OTIMIZADO
  private static isCacheValid(cacheData: CachedWordData): boolean {
    if (!cacheData) return false;
    
    const age = Date.now() - cacheData.timestamp;
    const isExpired = age > CACHE_DURATION;
    const isValidVersion = cacheData.version === CACHE_VERSION;
    const hasWords = cacheData.words && cacheData.words.length > 0;
    
    return !isExpired && isValidVersion && hasWords;
  }

  // Obter palavras do cache local OTIMIZADO
  static getCachedWords(maxLength: number, count: number = 5, difficulty?: string): string[] | null {
    if (!this.cache) this.initializeCache();
    
    const cacheKey = this.generateCacheKey(maxLength, difficulty);
    const cacheData = this.cache?.[cacheKey];
    
    if (!cacheData || !this.isCacheValid(cacheData)) {
      this.metrics.misses++;
      
      logger.debug('💾 Cache miss ou inválido', { 
        cacheKey, 
        exists: !!cacheData,
        valid: cacheData ? this.isCacheValid(cacheData) : false,
        misses: this.metrics.misses
      }, 'LOCAL_CACHE');
      return null;
    }
    
    // Atualizar métricas de acesso
    cacheData.hits++;
    cacheData.lastAccessed = Date.now();
    this.metrics.hits++;
    
    // Seleção aleatória otimizada
    const available = cacheData.words.filter(word => 
      word && word.length <= maxLength && word.length >= 3
    );
    
    if (available.length < count) {
      logger.warn('⚠️ Cache com poucas palavras válidas', { 
        available: available.length,
        requested: count
      }, 'LOCAL_CACHE');
    }
    
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    
    logger.info('✅ Palavras obtidas do cache local otimizado', { 
      cacheKey,
      available: available.length,
      selected: selected.length,
      hits: cacheData.hits,
      age: Math.round((Date.now() - cacheData.timestamp) / (1000 * 60))
    }, 'LOCAL_CACHE');
    
    // Salvar métricas atualizadas
    this.saveCache();
    
    return selected;
  }

  // Armazenar palavras no cache local OTIMIZADO
  static setCachedWords(
    words: string[], 
    maxLength: number, 
    difficulty: string = 'mixed'
  ): void {
    if (!this.cache) this.initializeCache();
    if (!words || words.length === 0) return;
    
    // Filtrar e validar palavras de forma mais rigorosa
    const validWords = words
      .map(word => normalizeText(word))
      .filter(word => word && typeof word === 'string')
      .filter(word => isValidGameWord(word, maxLength))
      .filter(word => word.length >= 3 && word.length <= maxLength)
      .filter((word, index, array) => array.indexOf(word) === index); // remover duplicatas
    
    if (validWords.length === 0) {
      logger.warn('⚠️ Nenhuma palavra válida para cache otimizado', { 
        originalCount: words.length,
        maxLength 
      }, 'LOCAL_CACHE');
      return;
    }
    
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
    
    if (!this.cache) this.cache = {};
    this.cache[cacheKey] = cacheData;
    this.saveCache();
    
    logger.info('💾 Palavras armazenadas no cache local otimizado', { 
      cacheKey,
      wordsCount: validWords.length,
      maxLength,
      difficulty,
      totalCacheEntries: Object.keys(this.cache).length
    }, 'LOCAL_CACHE');
  }

  // Limpar cache expirado OTIMIZADO
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
      this.metrics.cleans++;
      this.saveCache();
      
      logger.info('🧹 Cache local otimizado limpo', { 
        removedEntries: cleanedCount,
        totalCleans: this.metrics.cleans
      }, 'LOCAL_CACHE');
    }
  }

  // Obter estatísticas do cache MELHORADAS
  static getCacheStats(): { 
    totalEntries: number; 
    totalWords: number; 
    oldestEntry: number; 
    newestEntry: number;
    metrics: typeof LocalWordCacheManager.metrics;
    efficiency: number;
  } {
    if (!this.cache) this.initializeCache();
    
    const entries = Object.values(this.cache || {});
    const totalWords = entries.reduce((sum, entry) => sum + entry.words.length, 0);
    const timestamps = entries.map(entry => entry.timestamp);
    
    const totalRequests = this.metrics.hits + this.metrics.misses;
    const efficiency = totalRequests > 0 ? (this.metrics.hits / totalRequests) * 100 : 0;
    
    return {
      totalEntries: entries.length,
      totalWords,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0,
      metrics: { ...this.metrics },
      efficiency: Math.round(efficiency)
    };
  }

  // Fallback de emergência com palavras hardcoded EXPANDIDO
  static getEmergencyFallback(count: number = 5): string[] {
    const emergencyWords = [
      // Palavras básicas 4-5 letras
      'CASA', 'AMOR', 'VIDA', 'TEMPO', 'MUNDO', 'PESSOA', 'LUGAR', 'FORMA',
      'PARTE', 'GRUPO', 'ESTADO', 'CIDADE', 'PAIS', 'ANOS', 'CASO', 'TIPO',
      'MODO', 'MEIO', 'AGUA', 'TERRA', 'FOGO', 'VENTO',
      
      // Palavras médias 6-7 letras
      'SISTEMA', 'GOVERNO', 'EMPRESA', 'TRABALHO', 'MOMENTO', 'PRODUTO',
      'SERVIÇO', 'PROJETO', 'PROGRAMA', 'HISTORIA', 'FAMILIA', 'CULTURA',
      'NATUREZA', 'ENERGIA', 'CIENCIA', 'MUSICA',
      
      // Palavras complexas 8+ letras
      'PROBLEMA', 'PROCESSO', 'EDUCACAO', 'MEDICINA', 'ENGENHARIA', 'FILOSOFIA',
      'PSICOLOGIA', 'LITERATURA', 'MATEMATICA', 'TECNOLOGIA'
    ];
    
    const shuffled = [...emergencyWords].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    
    logger.warn('🆘 Usando fallback de emergência otimizado', { 
      available: emergencyWords.length,
      selected: selected.length 
    }, 'LOCAL_CACHE');
    
    return selected;
  }

  // Obter métricas detalhadas
  static getDetailedMetrics() {
    const stats = this.getCacheStats();
    
    return {
      ...stats,
      performance: {
        hitRate: stats.efficiency,
        averageWordsPerEntry: stats.totalEntries > 0 ? 
          Math.round(stats.totalWords / stats.totalEntries) : 0,
        cacheUtilization: Math.round((stats.totalEntries / MAX_CACHE_ENTRIES) * 100)
      },
      health: stats.efficiency > 80 ? 'excellent' : 
              stats.efficiency > 60 ? 'good' : 
              stats.efficiency > 40 ? 'poor' : 'critical'
    };
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

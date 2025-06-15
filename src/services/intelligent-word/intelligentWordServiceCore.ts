
import { LocalWordCacheManager } from '@/utils/localWordCache';
import { selectRandomWords } from '@/utils/simpleWordDistribution';
import { logger } from '@/utils/logger';
import { intelligentWordServiceDatabase } from './intelligentWordServiceDatabase';
import { intelligentWordServiceDefaults } from './intelligentWordServiceDefaults';

export const intelligentWordServiceCore = {
  async getWordsWithIntelligentFallback(
    count: number = 5,
    maxLength: number = 8,
    level: number = 1,
    queryCache: Map<string, any>,
    QUERY_CACHE_DURATION: number
  ): Promise<{
    words: string[];
    source: 'database' | 'cache' | 'default' | 'emergency';
    processingTime: number;
  }> {
    const startTime = performance.now();
    
    logger.info('🧠 Seleção inteligente otimizada iniciada', { 
      count, 
      maxLength, 
      level 
    }, 'INTELLIGENT_WORD_SERVICE');

    try {
      // 1. TENTAR CACHE DE QUERY PRIMEIRO (novo)
      const queryCacheKey = `${maxLength}_${count}`;
      const cachedQuery = queryCache.get(queryCacheKey);
      
      if (cachedQuery && Date.now() - cachedQuery.timestamp < QUERY_CACHE_DURATION) {
        logger.info('⚡ Cache de query hit', { 
          maxLength, 
          wordsCount: cachedQuery.words.length 
        }, 'INTELLIGENT_WORD_SERVICE');
        
        return {
          words: selectRandomWords(cachedQuery.words, count),
          source: 'cache',
          processingTime: performance.now() - startTime
        };
      }

      // 2. TENTAR BANCO DE DADOS COM OTIMIZAÇÕES
      const dbWords = await intelligentWordServiceDatabase.tryOptimizedDatabaseSelection(count, maxLength);
      if (dbWords && dbWords.length >= count) {
        // Salvar no cache local E no cache de query
        LocalWordCacheManager.setCachedWords(dbWords, maxLength, 'mixed');
        queryCache.set(queryCacheKey, {
          words: dbWords,
          timestamp: Date.now(),
          maxLength
        });
        
        return {
          words: dbWords,
          source: 'database',
          processingTime: performance.now() - startTime
        };
      }

      // 3. FALLBACK PARA CACHE LOCAL INTELIGENTE
      logger.info('🔄 Tentando cache local inteligente', { maxLength }, 'INTELLIGENT_WORD_SERVICE');
      const cachedWords = LocalWordCacheManager.getCachedWords(maxLength, count);
      if (cachedWords && cachedWords.length >= count) {
        return {
          words: cachedWords,
          source: 'cache',
          processingTime: performance.now() - startTime
        };
      }

      // 4. FALLBACK PARA PALAVRAS PADRÃO OTIMIZADO
      logger.info('🔄 Tentando palavras padrão otimizadas', { level }, 'INTELLIGENT_WORD_SERVICE');
      const defaultWords = intelligentWordServiceDefaults.getOptimizedDefaultWordsForLevel(level, count, maxLength);
      if (defaultWords && defaultWords.length >= count) {
        return {
          words: defaultWords,
          source: 'default',
          processingTime: performance.now() - startTime
        };
      }

      // 5. FALLBACK DE EMERGÊNCIA
      logger.warn('🆘 Usando fallback de emergência otimizado', { count }, 'INTELLIGENT_WORD_SERVICE');
      const emergencyWords = LocalWordCacheManager.getEmergencyFallback(count);
      
      return {
        words: emergencyWords,
        source: 'emergency',
        processingTime: performance.now() - startTime
      };

    } catch (error) {
      logger.error('❌ Erro na seleção inteligente', { error }, 'INTELLIGENT_WORD_SERVICE');
      
      // Fallback absoluto de emergência
      const emergencyWords = LocalWordCacheManager.getEmergencyFallback(count);
      return {
        words: emergencyWords,
        source: 'emergency',
        processingTime: performance.now() - startTime
      };
    }
  }
};

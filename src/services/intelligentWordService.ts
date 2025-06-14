
import { supabase } from '@/integrations/supabase/client';
import { normalizeText, isValidGameWord } from '@/utils/levelConfiguration';
import { LocalWordCacheManager } from '@/utils/localWordCache';
import { selectRandomWords } from '@/utils/simpleWordDistribution';
import { logger } from '@/utils/logger';

interface DatabaseQueryCache {
  words: string[];
  timestamp: number;
  maxLength: number;
}

// Cache de queries do banco para evitar consultas duplicadas
const queryCache = new Map<string, DatabaseQueryCache>();
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
      const dbWords = await this.tryOptimizedDatabaseSelection(count, maxLength);
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
      const defaultWords = this.getOptimizedDefaultWordsForLevel(level, count, maxLength);
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

  // Tentar seleção do banco de dados OTIMIZADA
  private static async tryOptimizedDatabaseSelection(count: number, maxLength: number): Promise<string[] | null> {
    try {
      logger.debug('🔍 Tentando seleção otimizada do banco de dados', { count, maxLength }, 'INTELLIGENT_WORD_SERVICE');
      
      // Query otimizada com filtros mais inteligentes
      const { data: words, error } = await supabase
        .from('level_words')
        .select('word, difficulty')
        .eq('is_active', true)
        .order('created_at', { ascending: false }) // Palavras mais recentes primeiro
        .limit(Math.min(200, count * 20)); // Limite dinâmico baseado na necessidade

      if (error) {
        logger.warn('⚠️ Erro na consulta otimizada do banco', { error }, 'INTELLIGENT_WORD_SERVICE');
        return null;
      }

      if (!words || words.length === 0) {
        logger.warn('📭 Nenhuma palavra encontrada no banco otimizado', undefined, 'INTELLIGENT_WORD_SERVICE');
        return null;
      }

      // Filtrar e normalizar palavras válidas com priorização por dificuldade
      const processedWords = words
        .filter(w => w.word && typeof w.word === 'string')
        .map(w => ({
          word: normalizeText(w.word),
          difficulty: w.difficulty || 'medium'
        }))
        .filter(w => isValidGameWord(w.word, maxLength));

      if (processedWords.length === 0) {
        logger.warn('⚠️ Nenhuma palavra válida após filtros otimizados', { 
          totalWords: words.length,
          maxLength 
        }, 'INTELLIGENT_WORD_SERVICE');
        return null;
      }

      // Seleção inteligente baseada em dificuldade
      const selectedWords = this.intelligentWordSelection(processedWords, count);
      
      logger.info('✅ Seleção otimizada do banco concluída', { 
        totalWords: words.length,
        validWords: processedWords.length,
        selectedWords: selectedWords.length
      }, 'INTELLIGENT_WORD_SERVICE');

      return selectedWords;

    } catch (error) {
      logger.error('❌ Erro na seleção otimizada do banco de dados', { error }, 'INTELLIGENT_WORD_SERVICE');
      return null;
    }
  }

  // Seleção inteligente de palavras baseada em dificuldade
  private static intelligentWordSelection(
    words: { word: string; difficulty: string }[], 
    count: number
  ): string[] {
    // Distribuição equilibrada de dificuldades
    const easyWords = words.filter(w => w.difficulty === 'easy');
    const mediumWords = words.filter(w => w.difficulty === 'medium');
    const hardWords = words.filter(w => w.difficulty === 'hard');
    
    const selected: string[] = [];
    const targetDistribution = {
      easy: Math.ceil(count * 0.4),   // 40% fáceis
      medium: Math.ceil(count * 0.4), // 40% médias
      hard: Math.floor(count * 0.2)   // 20% difíceis
    };
    
    // Selecionar de cada categoria
    selected.push(...selectRandomWords(easyWords.map(w => w.word), targetDistribution.easy));
    selected.push(...selectRandomWords(mediumWords.map(w => w.word), targetDistribution.medium));
    selected.push(...selectRandomWords(hardWords.map(w => w.word), targetDistribution.hard));
    
    // Se não temos palavras suficientes, completar com qualquer uma disponível
    if (selected.length < count) {
      const remaining = words
        .map(w => w.word)
        .filter(word => !selected.includes(word));
      selected.push(...selectRandomWords(remaining, count - selected.length));
    }
    
    return selected.slice(0, count);
  }

  // Obter palavras padrão para o nível OTIMIZADO
  private static getOptimizedDefaultWordsForLevel(level: number, count: number, maxLength: number): string[] | null {
    try {
      // Palavras padrão expandidas e categorizadas por tamanho
      const wordsByLength = {
        4: ['CASA', 'AMOR', 'VIDA', 'TEMPO', 'MUNDO', 'FORMA', 'PARTE'],
        5: ['PESSOA', 'LUGAR', 'GRUPO', 'ESTADO', 'CIDADE', 'PAIS', 'ANOS'],
        6: ['SISTEMA', 'EMPRESA', 'MOMENTO', 'PRODUTO', 'SERVIÇO', 'PROJETO'],
        7: ['PROBLEMA', 'GOVERNO', 'TRABALHO', 'PROCESSO', 'PROGRAMA'],
        8: ['PROGRAMA', 'PROCESSO', 'PRODUTO', 'SISTEMA', 'EMPRESA']
      };

      // Selecionar palavras apropriadas para o tamanho máximo
      const availableWords: string[] = [];
      
      Object.entries(wordsByLength).forEach(([length, words]) => {
        if (parseInt(length) <= maxLength) {
          availableWords.push(...words);
        }
      });

      if (availableWords.length === 0) {
        return null;
      }

      // Remover duplicatas e selecionar aleatoriamente
      const uniqueWords = [...new Set(availableWords)];
      return selectRandomWords(uniqueWords, count);

    } catch (error) {
      logger.error('❌ Erro ao obter palavras padrão otimizadas', { error, level }, 'INTELLIGENT_WORD_SERVICE');
      return null;
    }
  }

  // Pré-carregar cache OTIMIZADO
  static async preloadCache(maxLength: number = 8): Promise<void> {
    try {
      logger.info('🔥 Pré-carregando cache inteligente otimizado', { maxLength }, 'INTELLIGENT_WORD_SERVICE');
      
      // Verificar se já existe cache recente para este tamanho
      const existingCache = LocalWordCacheManager.getCachedWords(maxLength, 1);
      if (existingCache && existingCache.length > 0) {
        logger.info('✅ Cache já existe para maxLength', { maxLength }, 'INTELLIGENT_WORD_SERVICE');
        return;
      }
      
      const dbWords = await this.tryOptimizedDatabaseSelection(100, maxLength);
      if (dbWords && dbWords.length > 0) {
        LocalWordCacheManager.setCachedWords(dbWords, maxLength, 'preload');
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

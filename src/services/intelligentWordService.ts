
import { supabase } from '@/integrations/supabase/client';
import { normalizeText, isValidGameWord } from '@/utils/levelConfiguration';
import { LocalWordCacheManager } from '@/utils/localWordCache';
import { selectRandomWords } from '@/utils/simpleWordDistribution';
import { logger } from '@/utils/logger';

export class IntelligentWordService {
  // Seleção inteligente com múltiplos fallbacks
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
    
    logger.info('🧠 Seleção inteligente iniciada', { 
      count, 
      maxLength, 
      level 
    }, 'INTELLIGENT_WORD_SERVICE');

    try {
      // 1. TENTAR BANCO DE DADOS PRIMEIRO
      const dbWords = await this.tryDatabaseSelection(count, maxLength);
      if (dbWords && dbWords.length >= count) {
        // Salvar no cache local para futuro uso
        LocalWordCacheManager.setCachedWords(dbWords, maxLength, 'mixed');
        
        return {
          words: dbWords,
          source: 'database',
          processingTime: performance.now() - startTime
        };
      }

      // 2. FALLBACK PARA CACHE LOCAL
      logger.info('🔄 Tentando cache local', { maxLength }, 'INTELLIGENT_WORD_SERVICE');
      const cachedWords = LocalWordCacheManager.getCachedWords(maxLength, count);
      if (cachedWords && cachedWords.length >= count) {
        return {
          words: cachedWords,
          source: 'cache',
          processingTime: performance.now() - startTime
        };
      }

      // 3. FALLBACK PARA PALAVRAS PADRÃO
      logger.info('🔄 Tentando palavras padrão', { level }, 'INTELLIGENT_WORD_SERVICE');
      const defaultWords = this.getDefaultWordsForLevel(level, count);
      if (defaultWords && defaultWords.length >= count) {
        return {
          words: defaultWords,
          source: 'default',
          processingTime: performance.now() - startTime
        };
      }

      // 4. FALLBACK DE EMERGÊNCIA
      logger.warn('🆘 Usando fallback de emergência', { count }, 'INTELLIGENT_WORD_SERVICE');
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

  // Tentar seleção do banco de dados
  private static async tryDatabaseSelection(count: number, maxLength: number): Promise<string[] | null> {
    try {
      logger.debug('🔍 Tentando seleção do banco de dados', { count, maxLength }, 'INTELLIGENT_WORD_SERVICE');
      
      const { data: words, error } = await supabase
        .from('level_words')
        .select('word')
        .eq('is_active', true)
        .limit(100); // Limitar para não sobrecarregar

      if (error) {
        logger.warn('⚠️ Erro na consulta do banco', { error }, 'INTELLIGENT_WORD_SERVICE');
        return null;
      }

      if (!words || words.length === 0) {
        logger.warn('📭 Nenhuma palavra encontrada no banco', undefined, 'INTELLIGENT_WORD_SERVICE');
        return null;
      }

      // Filtrar e normalizar palavras válidas
      const validWords = words
        .filter(w => w.word && typeof w.word === 'string')
        .map(w => normalizeText(w.word))
        .filter(word => isValidGameWord(word, maxLength));

      if (validWords.length === 0) {
        logger.warn('⚠️ Nenhuma palavra válida após filtros', { 
          totalWords: words.length,
          maxLength 
        }, 'INTELLIGENT_WORD_SERVICE');
        return null;
      }

      // Seleção aleatória
      const selectedWords = selectRandomWords(validWords, count);
      
      logger.info('✅ Seleção do banco concluída', { 
        totalWords: words.length,
        validWords: validWords.length,
        selectedWords: selectedWords.length
      }, 'INTELLIGENT_WORD_SERVICE');

      return selectedWords;

    } catch (error) {
      logger.error('❌ Erro na seleção do banco de dados', { error }, 'INTELLIGENT_WORD_SERVICE');
      return null;
    }
  }

  // Obter palavras padrão para o nível
  private static getDefaultWordsForLevel(level: number, count: number): string[] | null {
    try {
      // Palavras padrão baseadas no nível
      const levelWordSets = {
        1: ['CASA', 'AMOR', 'VIDA', 'TEMPO', 'MUNDO'],
        2: ['PESSOA', 'LUGAR', 'FORMA', 'PARTE', 'GRUPO'],
        3: ['PROBLEMA', 'SISTEMA', 'GOVERNO', 'EMPRESA', 'TRABALHO'],
        4: ['PROCESSO', 'PROJETO', 'PRODUTO', 'SERVIÇO', 'MOMENTO'],
        5: ['ESTADO', 'CIDADE', 'PAIS', 'ANOS', 'CASO']
      };

      const baseLevel = Math.min(Math.max(1, level), 5);
      const wordsForLevel = levelWordSets[baseLevel as keyof typeof levelWordSets] || levelWordSets[1];
      
      // Se precisar de mais palavras, combinar com outros níveis
      if (wordsForLevel.length < count) {
        const allWords = Object.values(levelWordSets).flat();
        const shuffled = [...allWords].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
      }

      return wordsForLevel.slice(0, count);

    } catch (error) {
      logger.error('❌ Erro ao obter palavras padrão', { error, level }, 'INTELLIGENT_WORD_SERVICE');
      return null;
    }
  }

  // Pré-carregar cache para melhor performance
  static async preloadCache(maxLength: number = 8): Promise<void> {
    try {
      logger.info('🔥 Pré-carregando cache inteligente', { maxLength }, 'INTELLIGENT_WORD_SERVICE');
      
      const dbWords = await this.tryDatabaseSelection(50, maxLength);
      if (dbWords && dbWords.length > 0) {
        LocalWordCacheManager.setCachedWords(dbWords, maxLength, 'preload');
        logger.info('✅ Cache pré-carregado com sucesso', { 
          wordsCount: dbWords.length 
        }, 'INTELLIGENT_WORD_SERVICE');
      }
    } catch (error) {
      logger.warn('⚠️ Erro no pré-carregamento do cache', { error }, 'INTELLIGENT_WORD_SERVICE');
    }
  }
}

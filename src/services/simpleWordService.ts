
import { supabase } from '@/integrations/supabase/client';
import { normalizeText, isValidGameWord } from '@/utils/levelConfiguration';
import { logger } from '@/utils/logger';

// Cache local consolidado
let wordCache: string[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Palavras de emergência garantidas
const EMERGENCY_WORDS = ['CASA', 'AMOR', 'VIDA', 'TEMPO', 'MUNDO'];

export class SimpleWordService {
  // Método principal - sempre retorna exatamente 5 palavras
  static async getRandomWordsForToday(
    count: number = 5,
    maxLength: number = 8
  ): Promise<string[]> {
    logger.info('🎯 Iniciando seleção de palavras', { count, maxLength }, 'SIMPLE_WORD_SERVICE');
    
    try {
      // 1. Tentar cache primeiro
      if (this.isValidCache()) {
        const cachedWords = this.getCachedWords(maxLength, count);
        if (cachedWords.length >= count) {
          logger.info('📦 Usando palavras do cache', { count: cachedWords.length }, 'SIMPLE_WORD_SERVICE');
          return this.ensureExactCount(cachedWords, count);
        }
      }

      // 2. Buscar do banco de dados
      logger.info('🔍 Buscando palavras do banco', { count, maxLength }, 'SIMPLE_WORD_SERVICE');
      
      const { data: allWords, error } = await supabase
        .from('level_words')
        .select('word')
        .eq('is_active', true)
        .limit(200); // Buscar mais palavras para melhor seleção

      if (error) {
        throw new Error(`Erro no banco: ${error.message}`);
      }

      if (!allWords || allWords.length === 0) {
        throw new Error('Banco vazio');
      }

      // 3. Filtrar e validar palavras
      const validWords = allWords
        .filter(w => w.word && typeof w.word === 'string')
        .map(w => normalizeText(w.word))
        .filter(word => isValidGameWord(word, maxLength))
        .filter(word => word.length >= 3 && word.length <= maxLength);

      if (validWords.length === 0) {
        throw new Error('Nenhuma palavra válida encontrada');
      }

      // 4. Atualizar cache com palavras válidas
      this.updateCache(validWords);
      
      // 5. Selecionar palavras aleatórias
      const selectedWords = this.selectRandomWords(validWords, count);
      
      logger.info('✅ Palavras selecionadas do banco', {
        total: validWords.length,
        selected: selectedWords.length,
        words: selectedWords
      }, 'SIMPLE_WORD_SERVICE');

      return this.ensureExactCount(selectedWords, count);
      
    } catch (error) {
      logger.error('❌ Erro na seleção - usando emergência', { error }, 'SIMPLE_WORD_SERVICE');
      return this.getEmergencyWords(count);
    }
  }

  // Garantir que sempre temos exatamente o número solicitado
  private static ensureExactCount(words: string[], count: number): string[] {
    if (words.length >= count) {
      return words.slice(0, count);
    }
    
    // Se temos menos palavras, completar com emergência
    const emergency = EMERGENCY_WORDS.filter(w => !words.includes(w));
    const needed = count - words.length;
    const additional = emergency.slice(0, needed);
    
    logger.warn('⚠️ Completando com palavras de emergência', {
      original: words.length,
      needed,
      final: words.length + additional.length
    }, 'SIMPLE_WORD_SERVICE');
    
    return [...words, ...additional].slice(0, count);
  }

  // Palavras de emergência
  private static getEmergencyWords(count: number): string[] {
    logger.info('🆘 Usando palavras de emergência', { count }, 'SIMPLE_WORD_SERVICE');
    return EMERGENCY_WORDS.slice(0, count);
  }

  // Seleção aleatória simples
  private static selectRandomWords(words: string[], count: number): string[] {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // Métodos de cache consolidados
  private static isValidCache(): boolean {
    return wordCache.length > 0 && Date.now() - cacheTimestamp < CACHE_DURATION;
  }

  private static getCachedWords(maxLength: number, count: number): string[] {
    return wordCache
      .filter(word => word.length <= maxLength && word.length >= 3)
      .slice(0, count);
  }

  private static updateCache(words: string[]): void {
    if (words && words.length > 0) {
      wordCache = [...words];
      cacheTimestamp = Date.now();
      logger.info(`📦 Cache atualizado: ${words.length} palavras`, undefined, 'SIMPLE_WORD_SERVICE');
    }
  }

  // Registrar uso das palavras (opcional)
  static async recordWordsUsage(words: string[]): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const usageRecords = words.map(word => ({
        user_id: user.id,
        word: word.toUpperCase(),
        level: 1,
        category: 'aleatorio',
        used_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('user_word_history')
        .insert(usageRecords);

      if (error) {
        logger.warn('Erro ao registrar uso das palavras', { error }, 'SIMPLE_WORD_SERVICE');
      } else {
        logger.info('📝 Uso das palavras registrado', { wordsCount: words.length }, 'SIMPLE_WORD_SERVICE');
      }
    } catch (error) {
      logger.warn('Erro no registro de uso de palavras', { error }, 'SIMPLE_WORD_SERVICE');
    }
  }

  // Estatísticas do cache
  static getCacheStats() {
    return {
      totalWords: wordCache.length,
      cacheAge: cacheTimestamp > 0 ? Date.now() - cacheTimestamp : 0,
      isValid: this.isValidCache()
    };
  }

  // Limpar cache
  static clearCache(): void {
    wordCache = [];
    cacheTimestamp = 0;
    logger.info('🗑️ Cache limpo', undefined, 'SIMPLE_WORD_SERVICE');
  }
}

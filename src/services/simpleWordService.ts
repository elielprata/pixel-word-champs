
import { supabase } from '@/integrations/supabase/client';
import { normalizeText, isValidGameWord } from '@/utils/levelConfiguration';
import { selectRandomWords } from '@/utils/simpleWordDistribution';
import { logger } from '@/utils/logger';

export class SimpleWordService {
  // Cache local simples
  private static wordCache: string[] = [];
  private static cacheTimestamp = 0;
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  // Buscar palavras aleatórias com cache
  static async getRandomWordsForToday(
    count: number = 5,
    maxLength: number = 8
  ): Promise<string[]> {
    try {
      // Verificar cache primeiro
      if (this.isValidCache()) {
        const cachedWords = this.getCachedWords(maxLength, count);
        if (cachedWords.length >= count) {
          logger.info('📦 Usando palavras do cache', { 
            count: cachedWords.length 
          }, 'SIMPLE_WORD_SERVICE');
          return cachedWords;
        }
      }

      logger.info('🔍 Buscando palavras do banco', { count, maxLength }, 'SIMPLE_WORD_SERVICE');

      // Buscar do banco de dados
      const { data: allWords, error } = await supabase
        .from('level_words')
        .select('word')
        .eq('is_active', true)
        .limit(100); // Limitar para performance

      if (error) {
        throw new Error(`Erro ao buscar palavras: ${error.message}`);
      }

      if (!allWords || allWords.length === 0) {
        throw new Error('Nenhuma palavra encontrada');
      }

      // Filtrar e normalizar
      const validWords = allWords
        .filter(w => w.word && typeof w.word === 'string')
        .map(w => normalizeText(w.word))
        .filter(word => isValidGameWord(word, maxLength))
        .filter(word => word.length >= 3);

      if (validWords.length === 0) {
        throw new Error('Nenhuma palavra válida encontrada');
      }

      // Atualizar cache
      this.updateCache(validWords);
      
      // Selecionar palavras aleatórias
      const selectedWords = selectRandomWords(validWords, count);
      
      logger.info('✅ Palavras selecionadas', {
        total: validWords.length,
        selected: selectedWords.length,
        words: selectedWords
      }, 'SIMPLE_WORD_SERVICE');

      return selectedWords;
      
    } catch (error) {
      logger.error('❌ Erro na seleção de palavras', { error }, 'SIMPLE_WORD_SERVICE');
      throw error;
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

  // Métodos privados para cache
  private static isValidCache(): boolean {
    return this.wordCache.length > 0 && 
           Date.now() - this.cacheTimestamp < this.CACHE_DURATION;
  }

  private static getCachedWords(maxLength: number, count: number): string[] {
    return this.wordCache
      .filter(word => word.length <= maxLength && word.length >= 3)
      .slice(0, count);
  }

  private static updateCache(words: string[]): void {
    this.wordCache = [...words];
    this.cacheTimestamp = Date.now();
  }
}

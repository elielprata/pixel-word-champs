
import { supabase } from '@/integrations/supabase/client';
import { normalizeText, isValidGameWord } from '@/utils/levelConfiguration';
import { selectRandomWords } from '@/utils/simpleWordDistribution';
import { logger } from '@/utils/logger';

export class SimpleWordService {
  // Buscar palavras aleatórias evitando repetição no dia
  static async getRandomWordsForToday(
    count: number = 5,
    maxLength: number = 8
  ): Promise<string[]> {
    try {
      logger.info('🎲 Buscando palavras aleatórias para hoje', { count, maxLength }, 'SIMPLE_WORD_SERVICE');

      // Buscar todas as palavras ativas
      const { data: allWords, error } = await supabase
        .from('level_words')
        .select('word')
        .eq('is_active', true);

      if (error) {
        throw new Error(`Erro ao buscar palavras: ${error.message}`);
      }

      if (!allWords || allWords.length === 0) {
        throw new Error('Nenhuma palavra encontrada');
      }

      // Filtrar e normalizar palavras válidas
      const validWords = allWords
        .filter(w => w.word && typeof w.word === 'string')
        .map(w => normalizeText(w.word))
        .filter(word => isValidGameWord(word, maxLength));

      if (validWords.length === 0) {
        throw new Error('Nenhuma palavra válida encontrada');
      }

      // Obter palavras já usadas hoje
      const usedToday = await this.getTodayUsedWords();
      
      // Filtrar palavras não usadas hoje
      const availableWords = validWords.filter(word => !usedToday.has(word.toUpperCase()));
      
      // Se não há palavras suficientes não usadas, usar todas as válidas
      const wordsToSelect = availableWords.length >= count ? availableWords : validWords;
      
      // Seleção aleatória simples
      const selectedWords = selectRandomWords(wordsToSelect, count);
      
      logger.info('✅ Palavras aleatórias selecionadas', {
        total: validWords.length,
        usedToday: usedToday.size,
        available: availableWords.length,
        selected: selectedWords.length,
        words: selectedWords
      }, 'SIMPLE_WORD_SERVICE');

      return selectedWords;
      
    } catch (error) {
      logger.error('❌ Erro na seleção aleatória de palavras', { error }, 'SIMPLE_WORD_SERVICE');
      throw error;
    }
  }

  // Obter palavras já usadas hoje pelo usuário
  private static async getTodayUsedWords(): Promise<Set<string>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return new Set();
      }

      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const { data: history, error } = await supabase
        .from('user_word_history')
        .select('word')
        .eq('user_id', user.id)
        .gte('used_at', startOfDay.toISOString());

      if (error) {
        logger.warn('Erro ao buscar histórico do usuário', { error }, 'SIMPLE_WORD_SERVICE');
        return new Set();
      }

      return new Set(history?.map(h => h.word.toUpperCase()) || []);
      
    } catch (error) {
      logger.warn('Erro ao verificar palavras usadas hoje', { error }, 'SIMPLE_WORD_SERVICE');
      return new Set();
    }
  }

  // Registrar uso das palavras
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
}

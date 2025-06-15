
import { supabase } from '@/integrations/supabase/client';
import { normalizeText, isValidGameWord } from '@/utils/levelConfiguration';
import { logger } from '@/utils/logger';

// Palavras de emergência garantidas
const EMERGENCY_WORDS = ['CASA', 'AMOR', 'VIDA', 'TEMPO', 'MUNDO'];

export class SimpleWordService {
  // Método principal - sempre retorna exatamente 5 palavras
  static async getRandomWordsForToday(
    count: number = 5,
    maxLength: number = 8
  ): Promise<string[]> {
    logger.info('🎯 Buscando palavras simples', { count, maxLength }, 'SIMPLE_WORD_SERVICE');
    
    try {
      // Buscar do banco de dados
      const { data: allWords, error } = await supabase
        .from('level_words')
        .select('word')
        .eq('is_active', true)
        .limit(100);

      if (error) {
        throw new Error(`Erro no banco: ${error.message}`);
      }

      if (!allWords || allWords.length === 0) {
        throw new Error('Banco vazio');
      }

      // Filtrar e validar palavras
      const validWords = allWords
        .filter(w => w.word && typeof w.word === 'string')
        .map(w => normalizeText(w.word))
        .filter(word => isValidGameWord(word, maxLength))
        .filter(word => word.length >= 3 && word.length <= maxLength);

      if (validWords.length === 0) {
        throw new Error('Nenhuma palavra válida encontrada');
      }

      // Selecionar palavras aleatórias
      const selectedWords = this.selectRandomWords(validWords, count);
      
      logger.info('✅ Palavras selecionadas', {
        total: validWords.length,
        selected: selectedWords.length,
        words: selectedWords
      }, 'SIMPLE_WORD_SERVICE');

      return this.ensureExactCount(selectedWords, count);
      
    } catch (error) {
      logger.error('❌ Erro - usando emergência', { error }, 'SIMPLE_WORD_SERVICE');
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
      }
    } catch (error) {
      logger.warn('Erro no registro de uso de palavras', { error }, 'SIMPLE_WORD_SERVICE');
    }
  }
}

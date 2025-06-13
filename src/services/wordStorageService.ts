
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface WordData {
  word: string;
  category: string;
  difficulty: string;
  level: number;
}

export const saveWordsToDatabase = async (words: WordData[]): Promise<{ success: boolean; count?: number; error?: string }> => {
  try {
    logger.info('Salvando palavras no banco de dados', { count: words.length }, 'WORD_STORAGE_SERVICE');

    const { error } = await supabase
      .from('level_words')
      .insert(words.map(word => ({
        word: word.word,
        category: word.category,
        difficulty: word.difficulty,
        level: word.level,
        is_active: true
      })));

    if (error) {
      logger.error('Erro ao salvar palavras no banco de dados', { error }, 'WORD_STORAGE_SERVICE');
      return { success: false, error: error.message };
    }

    logger.info('Palavras salvas com sucesso', { count: words.length }, 'WORD_STORAGE_SERVICE');
    return { success: true, count: words.length };
  } catch (error) {
    logger.error('Erro crítico ao salvar palavras', { error }, 'WORD_STORAGE_SERVICE');
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
};

class WordStorageService {
  async getWords(level?: number, category?: string): Promise<WordData[]> {
    try {
      logger.debug('Buscando palavras', { level, category }, 'WORD_STORAGE_SERVICE');

      let query = supabase
        .from('level_words')
        .select('*')
        .eq('is_active', true);

      if (level) {
        query = query.eq('level', level);
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data: words, error } = await query.order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar palavras no banco de dados', { 
          level, 
          category, 
          error 
        }, 'WORD_STORAGE_SERVICE');
        throw error;
      }

      logger.debug('Palavras carregadas com sucesso', { 
        level, 
        category, 
        count: words?.length || 0 
      }, 'WORD_STORAGE_SERVICE');

      return words || [];
    } catch (error) {
      logger.error('Erro crítico ao buscar palavras', { level, category, error }, 'WORD_STORAGE_SERVICE');
      return [];
    }
  }

  async saveWords(words: WordData[]): Promise<{ success: boolean; count?: number; error?: string }> {
    return saveWordsToDatabase(words);
  }

  async deleteWord(wordId: string): Promise<boolean> {
    try {
      logger.info('Removendo palavra', { wordId }, 'WORD_STORAGE_SERVICE');

      const { error } = await supabase
        .from('level_words')
        .update({ is_active: false })
        .eq('id', wordId);

      if (error) {
        logger.error('Erro ao remover palavra no banco de dados', { 
          wordId, 
          error 
        }, 'WORD_STORAGE_SERVICE');
        throw error;
      }

      logger.info('Palavra removida com sucesso', { wordId }, 'WORD_STORAGE_SERVICE');
      return true;
    } catch (error) {
      logger.error('Erro crítico ao remover palavra', { wordId, error }, 'WORD_STORAGE_SERVICE');
      return false;
    }
  }

  async getWordsByCategory(category: string): Promise<WordData[]> {
    return this.getWords(undefined, category);
  }

  async getWordsByLevel(level: number): Promise<WordData[]> {
    return this.getWords(level);
  }
}

export const wordStorageService = new WordStorageService();

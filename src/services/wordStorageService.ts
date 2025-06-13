
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface WordData {
  word: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: string;
  is_active: boolean;
}

export interface StoredWord extends WordData {
  id: string;
  created_at: string;
  updated_at: string;
}

class WordStorageService {
  async addWord(wordData: WordData): Promise<StoredWord | null> {
    try {
      logger.info('Adicionando nova palavra', { 
        word: wordData.word,
        difficulty: wordData.difficulty,
        category: wordData.category 
      }, 'WORD_STORAGE_SERVICE');

      const { data: word, error } = await supabase
        .from('level_words')
        .insert(wordData)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao adicionar palavra no banco de dados', { 
          wordData, 
          error 
        }, 'WORD_STORAGE_SERVICE');
        throw error;
      }

      logger.info('Palavra adicionada com sucesso', { 
        wordId: word.id,
        word: word.word 
      }, 'WORD_STORAGE_SERVICE');

      return word;
    } catch (error) {
      logger.error('Erro crítico ao adicionar palavra', { 
        wordData, 
        error 
      }, 'WORD_STORAGE_SERVICE');
      return null;
    }
  }

  async getWords(filters?: { category?: string; difficulty?: string; is_active?: boolean }): Promise<StoredWord[]> {
    try {
      logger.debug('Buscando palavras', { filters }, 'WORD_STORAGE_SERVICE');

      let query = supabase.from('level_words').select('*');

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }

      if (typeof filters?.is_active === 'boolean') {
        query = query.eq('is_active', filters.is_active);
      }

      const { data: words, error } = await query.order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar palavras no banco de dados', { 
          filters, 
          error 
        }, 'WORD_STORAGE_SERVICE');
        throw error;
      }

      logger.debug('Palavras carregadas com sucesso', { 
        count: words?.length || 0,
        filters 
      }, 'WORD_STORAGE_SERVICE');

      return words || [];
    } catch (error) {
      logger.error('Erro crítico ao buscar palavras', { 
        filters, 
        error 
      }, 'WORD_STORAGE_SERVICE');
      return [];
    }
  }

  async updateWord(wordId: string, updates: Partial<WordData>): Promise<StoredWord | null> {
    try {
      logger.info('Atualizando palavra', { 
        wordId, 
        updates 
      }, 'WORD_STORAGE_SERVICE');

      const { data: word, error } = await supabase
        .from('level_words')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', wordId)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao atualizar palavra no banco de dados', { 
          wordId, 
          updates, 
          error 
        }, 'WORD_STORAGE_SERVICE');
        throw error;
      }

      logger.info('Palavra atualizada com sucesso', { 
        wordId,
        word: word.word 
      }, 'WORD_STORAGE_SERVICE');

      return word;
    } catch (error) {
      logger.error('Erro crítico ao atualizar palavra', { 
        wordId, 
        updates, 
        error 
      }, 'WORD_STORAGE_SERVICE');
      return null;
    }
  }

  async deleteWord(wordId: string): Promise<boolean> {
    try {
      logger.info('Removendo palavra', { wordId }, 'WORD_STORAGE_SERVICE');

      const { error } = await supabase
        .from('level_words')
        .delete()
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
      logger.error('Erro crítico ao remover palavra', { 
        wordId, 
        error 
      }, 'WORD_STORAGE_SERVICE');
      return false;
    }
  }

  async bulkAddWords(words: WordData[]): Promise<StoredWord[]> {
    try {
      logger.info('Adicionando palavras em lote', { 
        count: words.length 
      }, 'WORD_STORAGE_SERVICE');

      const { data: addedWords, error } = await supabase
        .from('level_words')
        .insert(words)
        .select();

      if (error) {
        logger.error('Erro ao adicionar palavras em lote no banco de dados', { 
          count: words.length, 
          error 
        }, 'WORD_STORAGE_SERVICE');
        throw error;
      }

      logger.info('Palavras adicionadas em lote com sucesso', { 
        count: addedWords?.length || 0 
      }, 'WORD_STORAGE_SERVICE');

      return addedWords || [];
    } catch (error) {
      logger.error('Erro crítico ao adicionar palavras em lote', { 
        count: words.length, 
        error 
      }, 'WORD_STORAGE_SERVICE');
      return [];
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      logger.debug('Buscando categorias de palavras', undefined, 'WORD_STORAGE_SERVICE');

      const { data, error } = await supabase
        .from('level_words')
        .select('category')
        .eq('is_active', true);

      if (error) {
        logger.error('Erro ao buscar categorias no banco de dados', { error }, 'WORD_STORAGE_SERVICE');
        throw error;
      }

      const categories = [...new Set(data?.map(item => item.category) || [])];

      logger.debug('Categorias carregadas com sucesso', { 
        count: categories.length 
      }, 'WORD_STORAGE_SERVICE');

      return categories;
    } catch (error) {
      logger.error('Erro crítico ao buscar categorias', { error }, 'WORD_STORAGE_SERVICE');
      return [];
    }
  }
}

export const wordStorageService = new WordStorageService();

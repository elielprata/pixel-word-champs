import { supabase } from '@/integrations/supabase/client';
import { DIFFICULTY_DISTRIBUTION } from '@/utils/levelConfiguration';
import { logger } from '@/utils/logger';

interface WordHistoryRecord {
  user_id: string;
  word: string;
  level_used: number;
  used_at: string;
}

class WordHistoryService {
  async recordWordsUsage(userId: string, words: string[], level: number): Promise<void> {
    try {
      logger.debug('Registrando uso de palavras no histórico', { 
        userId, 
        wordsCount: words.length, 
        level 
      }, 'WORD_HISTORY_SERVICE');

      const historyRecords = words.map(word => ({
        user_id: userId,
        word: word.toUpperCase(),
        level_used: level,
        used_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('user_word_history')
        .insert(historyRecords);

      if (error) {
        logger.error('Erro ao registrar histórico de palavras no banco de dados', { 
          userId, 
          wordsCount: words.length, 
          level, 
          error 
        }, 'WORD_HISTORY_SERVICE');
        throw error;
      }

      logger.info('Histórico de palavras registrado com sucesso', { 
        userId, 
        wordsCount: words.length, 
        level 
      }, 'WORD_HISTORY_SERVICE');
    } catch (error) {
      logger.warn('Erro não crítico ao registrar histórico', { 
        userId, 
        wordsCount: words.length, 
        level, 
        error 
      }, 'WORD_HISTORY_SERVICE');
    }
  }

  async getUserWordFrequency(userId: string): Promise<Record<string, number>> {
    try {
      logger.debug('Buscando frequência de palavras do usuário', { userId }, 'WORD_HISTORY_SERVICE');

      const { data, error } = await supabase
        .from('user_word_history')
        .select('word')
        .eq('user_id', userId);

      if (error) {
        logger.error('Erro ao buscar frequência de palavras no banco de dados', { 
          userId, 
          error 
        }, 'WORD_HISTORY_SERVICE');
        throw error;
      }

      const frequency: Record<string, number> = {};
      data?.forEach(record => {
        frequency[record.word] = (frequency[record.word] || 0) + 1;
      });

      logger.debug('Frequência de palavras calculada', { 
        userId, 
        uniqueWords: Object.keys(frequency).length 
      }, 'WORD_HISTORY_SERVICE');

      return frequency;
    } catch (error) {
      logger.warn('Erro ao calcular frequência - retornando objeto vazio', { 
        userId, 
        error 
      }, 'WORD_HISTORY_SERVICE');
      return {};
    }
  }

  async selectRandomizedWords(options: {
    userId: string;
    level: number;
    maxWordsNeeded: number;
  }): Promise<string[]> {
    try {
      logger.debug('Iniciando seleção randomizada de palavras', { 
        userId: options.userId, 
        level: options.level, 
        maxWordsNeeded: options.maxWordsNeeded 
      }, 'WORD_HISTORY_SERVICE');

      // Buscar frequência do usuário
      const userFrequency = await this.getUserWordFrequency(options.userId);

      // Buscar todas as palavras disponíveis
      const { data: allWords, error } = await supabase
        .from('level_words')
        .select('word, difficulty, category')
        .eq('is_active', true);

      if (error) {
        logger.error('Erro ao buscar palavras para seleção randomizada', { error }, 'WORD_HISTORY_SERVICE');
        throw error;
      }

      if (!allWords || allWords.length === 0) {
        logger.warn('Nenhuma palavra encontrada para seleção', undefined, 'WORD_HISTORY_SERVICE');
        return [];
      }

      logger.debug('Palavras carregadas para seleção', { 
        totalWords: allWords.length 
      }, 'WORD_HISTORY_SERVICE');

      // Aplicar algoritmo de seleção
      const selectedWords = this.selectWordsByFrequencyAndDifficulty(
        allWords,
        userFrequency,
        options.maxWordsNeeded
      );

      logger.info('Seleção randomizada concluída', { 
        selectedCount: selectedWords.length,
        requestedCount: options.maxWordsNeeded 
      }, 'WORD_HISTORY_SERVICE');

      return selectedWords;
    } catch (error) {
      logger.error('Erro crítico na seleção randomizada', { 
        userId: options.userId, 
        error 
      }, 'WORD_HISTORY_SERVICE');
      return [];
    }
  }

  private selectWordsByFrequencyAndDifficulty(
    words: Array<{ word: string; difficulty: string; category: string }>,
    userFrequency: Record<string, number>,
    maxWords: number
  ): string[] {
    try {
      logger.debug('Aplicando algoritmo de seleção por frequência e dificuldade', { 
        totalWords: words.length,
        maxWords,
        userFrequencyEntries: Object.keys(userFrequency).length 
      }, 'WORD_HISTORY_SERVICE');

      const selected: string[] = [];
      const wordsByDifficulty = {
        easy: words.filter(w => w.difficulty === 'easy'),
        medium: words.filter(w => w.difficulty === 'medium'),
        hard: words.filter(w => w.difficulty === 'hard'),
        expert: words.filter(w => w.difficulty === 'expert')
      };

      // Aplicar distribuição de dificuldade
      for (const [difficulty, targetCount] of Object.entries(DIFFICULTY_DISTRIBUTION)) {
        const availableWords = wordsByDifficulty[difficulty as keyof typeof wordsByDifficulty] || [];
        
        if (availableWords.length === 0) continue;

        // Ordenar por frequência (menos usadas primeiro)
        const sortedWords = availableWords.sort((a, b) => {
          const freqA = userFrequency[a.word.toUpperCase()] || 0;
          const freqB = userFrequency[b.word.toUpperCase()] || 0;
          return freqA - freqB;
        });

        // Selecionar palavras com randomização controlada
        const wordsToSelect = Math.min(targetCount, sortedWords.length);
        for (let i = 0; i < wordsToSelect && selected.length < maxWords; i++) {
          // Usar algoritmo de seleção weighted para favorecer palavras menos usadas
          const candidateIndex = this.getWeightedRandomIndex(sortedWords.length, i);
          const candidate = sortedWords[candidateIndex];
          
          if (candidate && !selected.includes(candidate.word.toUpperCase())) {
            selected.push(candidate.word.toUpperCase());
          }
        }
      }

      logger.debug('Seleção por algoritmo concluída', { 
        selectedCount: selected.length 
      }, 'WORD_HISTORY_SERVICE');

      return selected;
    } catch (error) {
      logger.error('Erro no algoritmo de seleção', { error }, 'WORD_HISTORY_SERVICE');
      return [];
    }
  }

  private getWeightedRandomIndex(totalLength: number, baseIndex: number): number {
    // Algoritmo para favorecer índices menores (palavras menos usadas)
    const weight = Math.random();
    if (weight < 0.6) {
      // 60% de chance de pegar uma das primeiras palavras (menos usadas)
      return Math.floor(Math.random() * Math.min(totalLength, 3));
    } else if (weight < 0.9) {
      // 30% de chance de pegar do meio
      const start = Math.min(totalLength, 3);
      const range = Math.max(1, totalLength - start);
      return start + Math.floor(Math.random() * Math.min(range, 5));
    } else {
      // 10% de chance de pegar qualquer uma
      return Math.floor(Math.random() * totalLength);
    }
  }

  async getWordUsageStats(userId: string): Promise<{
    totalWordsUsed: number;
    uniqueWords: number;
    mostUsedWord: string | null;
    recentWords: string[];
  }> {
    try {
      logger.debug('Calculando estatísticas de uso de palavras', { userId }, 'WORD_HISTORY_SERVICE');

      const { data, error } = await supabase
        .from('user_word_history')
        .select('word, used_at')
        .eq('user_id', userId)
        .order('used_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar estatísticas de palavras', { 
          userId, 
          error 
        }, 'WORD_HISTORY_SERVICE');
        throw error;
      }

      const frequency: Record<string, number> = {};
      data?.forEach(record => {
        frequency[record.word] = (frequency[record.word] || 0) + 1;
      });

      const mostUsedWord = Object.entries(frequency)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || null;

      const recentWords = [...new Set(data?.slice(0, 10).map(r => r.word) || [])];

      const stats = {
        totalWordsUsed: data?.length || 0,
        uniqueWords: Object.keys(frequency).length,
        mostUsedWord,
        recentWords
      };

      logger.debug('Estatísticas calculadas', { 
        userId, 
        stats 
      }, 'WORD_HISTORY_SERVICE');

      return stats;
    } catch (error) {
      logger.error('Erro ao calcular estatísticas', { 
        userId, 
        error 
      }, 'WORD_HISTORY_SERVICE');
      return {
        totalWordsUsed: 0,
        uniqueWords: 0,
        mostUsedWord: null,
        recentWords: []
      };
    }
  }
}

export const wordHistoryService = new WordHistoryService();

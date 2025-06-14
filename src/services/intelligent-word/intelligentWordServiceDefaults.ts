
import { selectRandomWords } from '@/utils/simpleWordDistribution';
import { logger } from '@/utils/logger';

export const intelligentWordServiceDefaults = {
  getOptimizedDefaultWordsForLevel(level: number, count: number, maxLength: number): string[] | null {
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
};

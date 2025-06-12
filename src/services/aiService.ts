
import { logger } from '@/utils/logger';

export interface WordPosition {
  word: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  direction: 'horizontal' | 'vertical' | 'diagonal';
}

export interface AIGeneratedData {
  validWords: WordPosition[];
  theme: string;
  difficulty: number;
}

class AIService {
  private config: {
    maxTokens: number;
    temperature: number;
    systemPrompt: string;
  } = {
    maxTokens: 1000,
    temperature: 0.7,
    systemPrompt: 'Você é um assistente especializado em jogos de palavras.'
  };

  setConfig(config: Partial<typeof this.config>) {
    this.config = { ...this.config, ...config };
    logger.debug('Configuração do AI Service atualizada', { config }, 'AI_SERVICE');
  }

  async generateWordsForBoard(board: string[][], level: number): Promise<AIGeneratedData> {
    logger.debug('Gerando palavras para tabuleiro', { boardSize: board.length, level }, 'AI_SERVICE');
    return this.getMockData(level);
  }

  private getMockData(level: number): AIGeneratedData {
    const mockWords: WordPosition[] = [
      {
        word: 'CASA',
        startRow: 0,
        startCol: 0,
        endRow: 0,
        endCol: 3,
        direction: 'horizontal'
      },
      {
        word: 'SOL',
        startRow: 1,
        startCol: 1,
        endRow: 1,
        endCol: 3,
        direction: 'horizontal'
      }
    ];

    const result = {
      validWords: mockWords,
      theme: 'Palavras Gerais',
      difficulty: level
    };

    logger.info('Dados mock gerados para AI', { wordsCount: mockWords.length, level }, 'AI_SERVICE');
    return result;
  }

  validateWord(word: string, positions: Array<{row: number, col: number}>, validWords: WordPosition[]): boolean {
    const isValid = validWords.some(validWord => validWord.word === word.toUpperCase());
    logger.debug('Validação de palavra', { word, isValid, positionsCount: positions.length }, 'AI_SERVICE');
    return isValid;
  }

  getHint(remainingWords: WordPosition[]): string | null {
    if (remainingWords.length === 0) {
      logger.debug('Nenhuma palavra restante para dica', undefined, 'AI_SERVICE');
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * remainingWords.length);
    const hint = remainingWords[randomIndex].word;
    logger.info('Dica gerada', { hint, remainingWordsCount: remainingWords.length }, 'AI_SERVICE');
    return hint;
  }
}

export const aiService = new AIService();

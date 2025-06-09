
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
  }

  async generateWordsForBoard(board: string[][], level: number): Promise<AIGeneratedData> {
    // Sempre retorna dados mock para o jogo funcionar
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

    return {
      validWords: mockWords,
      theme: 'Palavras Gerais',
      difficulty: level
    };
  }

  validateWord(word: string, positions: Array<{row: number, col: number}>, validWords: WordPosition[]): boolean {
    return validWords.some(validWord => validWord.word === word.toUpperCase());
  }

  getHint(remainingWords: WordPosition[]): string | null {
    if (remainingWords.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * remainingWords.length);
    return remainingWords[randomIndex].word;
  }
}

export const aiService = new AIService();

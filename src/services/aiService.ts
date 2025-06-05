
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
  async generateWordsForBoard(board: string[][], level: number): Promise<AIGeneratedData> {
    // Mock implementation - substituir por integração real com OpenAI
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

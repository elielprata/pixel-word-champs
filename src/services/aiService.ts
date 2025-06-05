
interface WordPosition {
  word: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  direction: 'horizontal' | 'vertical' | 'diagonal';
  points: number;
}

interface AIGeneratedData {
  validWords: WordPosition[];
  theme: string;
  difficulty: number;
}

class AIService {
  private apiKey: string = '';

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async generateWordsForBoard(board: string[][], level: number, theme?: string): Promise<AIGeneratedData> {
    if (!this.apiKey) {
      // Retorna dados mock se não há API key
      return this.generateMockData(board, level);
    }

    try {
      const boardString = board.map(row => row.join('')).join('\n');
      
      const prompt = `
        Analise este tabuleiro de letras ${board.length}x${board.length} e encontre TODAS as palavras válidas em português:

        ${boardString}

        Critérios:
        - Palavras de 3+ letras
        - Todas as direções permitidas (horizontal, vertical, diagonal)
        - Nível de dificuldade: ${level}
        - Tema: ${theme || 'geral'}
        
        Retorne um JSON com:
        {
          "validWords": [
            {
              "word": "PALAVRA",
              "startRow": 0,
              "startCol": 0,
              "endRow": 0,
              "endCol": 6,
              "direction": "horizontal",
              "points": 3
            }
          ],
          "theme": "${theme || 'geral'}",
          "difficulty": ${level}
        }
      `;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em jogos de palavras. Analise tabuleiros e encontre todas as palavras válidas em português.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro na API da OpenAI');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        return JSON.parse(content);
      } catch {
        return this.generateMockData(board, level);
      }
    } catch (error) {
      console.error('Erro ao gerar palavras com IA:', error);
      return this.generateMockData(board, level);
    }
  }

  private generateMockData(board: string[][], level: number): AIGeneratedData {
    // Dados mock para desenvolvimento
    const mockWords: WordPosition[] = [
      {
        word: 'CASA',
        startRow: 0,
        startCol: 0,
        endRow: 0,
        endCol: 3,
        direction: 'horizontal',
        points: 2
      },
      {
        word: 'GATO',
        startRow: 1,
        startCol: 0,
        endRow: 1,
        endCol: 3,
        direction: 'horizontal',
        points: 2
      }
    ];

    return {
      validWords: mockWords,
      theme: 'desenvolvimento',
      difficulty: level
    };
  }

  validateWord(word: string, positions: Array<{row: number, col: number}>, validWords: WordPosition[]): boolean {
    // Verifica se a palavra existe no gabarito de palavras válidas
    return validWords.some(validWord => {
      if (validWord.word !== word.toUpperCase()) return false;
      
      // Verifica se as posições correspondem
      const expectedPositions = this.getPositionsForWord(validWord);
      if (expectedPositions.length !== positions.length) return false;
      
      return expectedPositions.every((pos, index) => 
        pos.row === positions[index].row && pos.col === positions[index].col
      );
    });
  }

  private getPositionsForWord(wordData: WordPosition): Array<{row: number, col: number}> {
    const positions = [];
    const { startRow, startCol, endRow, endCol, direction } = wordData;
    
    if (direction === 'horizontal') {
      for (let col = startCol; col <= endCol; col++) {
        positions.push({ row: startRow, col });
      }
    } else if (direction === 'vertical') {
      for (let row = startRow; row <= endRow; row++) {
        positions.push({ row, col: startCol });
      }
    } else if (direction === 'diagonal') {
      const rowStep = endRow > startRow ? 1 : -1;
      const colStep = endCol > startCol ? 1 : -1;
      let row = startRow;
      let col = startCol;
      
      while (row !== endRow + rowStep && col !== endCol + colStep) {
        positions.push({ row, col });
        row += rowStep;
        col += colStep;
      }
    }
    
    return positions;
  }

  getHint(validWords: WordPosition[]): string | null {
    // Retorna uma palavra aleatória do gabarito como dica
    if (validWords.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * validWords.length);
    return validWords[randomIndex].word;
  }
}

export const aiService = new AIService();
export type { WordPosition, AIGeneratedData };

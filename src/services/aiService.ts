
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
  private apiKey: string | null = null;
  private config: {
    model: string;
    maxTokens: number;
    temperature: number;
    systemPrompt: string;
  } = {
    model: 'gpt-4o-mini',
    maxTokens: 1000,
    temperature: 0.7,
    systemPrompt: 'Você é um assistente especializado em jogos de palavras.'
  };

  setApiKey(key: string) {
    this.apiKey = key;
  }

  setConfig(config: Partial<typeof this.config>) {
    this.config = { ...this.config, ...config };
  }

  async generateWordsForBoard(board: string[][], level: number): Promise<AIGeneratedData> {
    if (!this.apiKey) {
      console.log('OpenAI API key não configurada, usando dados mock');
      return this.getMockData(level);
    }

    try {
      const boardStr = board.map(row => row.join(' ')).join('\n');
      
      const prompt = `
        Analise este tabuleiro de letras e encontre palavras válidas em português:
        
        ${boardStr}
        
        Nível: ${level}
        
        Encontre palavras que podem ser formadas horizontalmente, verticalmente ou diagonalmente.
        Retorne as palavras encontradas com suas posições exatas no formato JSON.
        
        Exemplo de resposta:
        {
          "validWords": [
            {
              "word": "CASA",
              "startRow": 0,
              "startCol": 0,
              "endRow": 0,
              "endCol": 3,
              "direction": "horizontal"
            }
          ],
          "theme": "Palavras do cotidiano",
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
          model: this.config.model,
          messages: [
            { role: 'system', content: this.config.systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Tentar parsear a resposta JSON
      try {
        const parsedData = JSON.parse(content);
        return parsedData;
      } catch (parseError) {
        console.error('Erro ao parsear resposta da OpenAI:', parseError);
        return this.getMockData(level);
      }
      
    } catch (error) {
      console.error('Erro ao conectar com OpenAI:', error);
      return this.getMockData(level);
    }
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
      theme: 'Palavras Gerais (Mock)',
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

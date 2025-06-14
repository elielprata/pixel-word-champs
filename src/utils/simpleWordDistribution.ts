
// Utilitário simples para distribuição aleatória de palavras
// Remove toda a complexidade de distribuição por dificuldade

export interface SimpleWordConfig {
  totalWords: number;
  maxWordLength: number;
  minWordLength: number;
}

export const getSimpleWordConfig = (boardSize: number): SimpleWordConfig => {
  return {
    totalWords: 5, // Sempre 5 palavras
    maxWordLength: Math.min(boardSize - 1, 8),
    minWordLength: 3
  };
};

// Função para validar se uma palavra é adequada para o tabuleiro
export const isWordSuitableForBoard = (word: string, config: SimpleWordConfig): boolean => {
  return word.length >= config.minWordLength && 
         word.length <= config.maxWordLength;
};

// Embaralhar array simples
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Selecionar palavras aleatórias sem qualquer regra de distribuição
export const selectRandomWords = (words: string[], count: number): string[] => {
  if (words.length === 0) return [];
  if (words.length <= count) return [...words];
  
  return shuffleArray(words).slice(0, count);
};

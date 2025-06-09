
// Função para determinar o tamanho máximo de palavras baseado no tamanho do tabuleiro
export const getMaxWordLength = (boardSize: number): number => {
  // A palavra não pode ser maior que o tamanho do tabuleiro
  // Deixando uma margem de segurança para colocação
  return Math.min(boardSize - 1, 8); // Máximo de 8 letras mesmo em tabuleiros grandes
};

// Função para determinar o tamanho mínimo de palavras baseado no tamanho do tabuleiro
export const getMinWordLength = (boardSize: number): number => {
  if (boardSize <= 5) return 3;   // Tabuleiros pequenos: palavras a partir de 3 letras
  if (boardSize <= 7) return 3;   // Tabuleiros médios: palavras a partir de 3 letras
  return 3;                       // Sempre pelo menos 3 letras
};

// Mapeamento de dificuldades por tamanho de palavra
export const getDifficultyByLength = (length: number): string => {
  if (length === 3) return 'easy';
  if (length === 4) return 'medium';
  if (length >= 5 && length <= 6) return 'hard';
  return 'expert';
};

// Filtrar palavras que cabem no tabuleiro e ainda não foram usadas
export const filterAvailableWords = (
  allWords: Array<{ word: string; difficulty: string }>,
  usedWords: Set<string>,
  maxLength: number,
  minLength: number
): Array<{ word: string; difficulty: string }> => {
  return allWords.filter(w => 
    !usedWords.has(w.word.toUpperCase()) &&
    w.word.length <= maxLength &&
    w.word.length >= minLength
  );
};

// Separar palavras por dificuldade
export const categorizeWordsByDifficulty = (
  words: Array<{ word: string; difficulty: string }>
) => {
  const wordsByDifficulty = {
    easy: words.filter(w => w.difficulty === 'easy' || w.word.length === 3),
    medium: words.filter(w => w.difficulty === 'medium' || w.word.length === 4),
    hard: words.filter(w => w.difficulty === 'hard' || (w.word.length >= 5 && w.word.length <= 6)),
    expert: words.filter(w => w.difficulty === 'expert' || w.word.length >= 7)
  };

  // Se não houver palavras com dificuldade definida, categorizar por tamanho
  if (Object.values(wordsByDifficulty).every(arr => arr.length === 0)) {
    console.log('🔄 Categorizando palavras por tamanho...');
    words.forEach(word => {
      const difficulty = getDifficultyByLength(word.word.length);
      if (wordsByDifficulty[difficulty as keyof typeof wordsByDifficulty]) {
        wordsByDifficulty[difficulty as keyof typeof wordsByDifficulty].push(word);
      }
    });
  }

  return wordsByDifficulty;
};

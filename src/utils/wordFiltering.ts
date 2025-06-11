
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

// Separar palavras por dificuldade (baseado apenas na classificação manual)
export const categorizeWordsByDifficulty = (
  words: Array<{ word: string; difficulty: string }>
) => {
  const wordsByDifficulty = {
    easy: words.filter(w => w.difficulty === 'easy'),
    medium: words.filter(w => w.difficulty === 'medium'),
    hard: words.filter(w => w.difficulty === 'hard'),
    expert: words.filter(w => w.difficulty === 'expert')
  };

  return wordsByDifficulty;
};

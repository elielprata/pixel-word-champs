
// Função para determinar dificuldade baseada no tamanho da palavra
export const getDifficultyFromLength = (length: number): string => {
  if (length === 3) return 'easy';
  if (length === 4) return 'medium';
  if (length >= 5 && length <= 7) return 'hard';
  if (length >= 8) return 'expert';
  return 'medium'; // fallback
};

// Configurações de distribuição por dificuldade
export const DIFFICULTY_DISTRIBUTION = {
  expert: 0.3,  // 30%
  hard: 0.3,    // 30%
  medium: 0.2,  // 20%
  easy: 0.2     // 20%
};

export const DIFFICULTY_LENGTHS = {
  easy: 3,
  medium: 4,
  hard: [5, 6, 7], // 5 a 7 letras
  expert: 8
};

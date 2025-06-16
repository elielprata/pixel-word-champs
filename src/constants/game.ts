
export const GAME_CONSTANTS = {
  // Palavras obrigatórias por nível
  TOTAL_WORDS_REQUIRED: 5,
  
  // Tamanhos do tabuleiro
  BOARD_HEIGHT: 12,
  BOARD_WIDTH: 8,
  
  // Tamanhos das células
  DESKTOP_CELL_SIZE: 28,
  MOBILE_CELL_SIZE: 24,
  
  // Larguras do tabuleiro
  DESKTOP_BOARD_WIDTH: 400,
  MOBILE_BOARD_WIDTH: 340,
  
  // Pontuação base por tamanho de palavra
  POINTS_BY_LENGTH: {
    3: 10,
    4: 20,
    5: 30,
    6: 40,
    7: 50
  } as const,
  
  // Hints
  MAX_HINTS_PER_LEVEL: 3,
  
  // Timing
  SELECTION_DEBOUNCE_MS: 100,
  
  // Cores para palavras encontradas
  WORD_COLORS: [
    '#ef4444', // red-500
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#8b5cf6', // violet-500
    '#06b6d4', // cyan-500
    '#84cc16', // lime-500
    '#f97316', // orange-500
  ] as const
};

export type WordColor = typeof GAME_CONSTANTS.WORD_COLORS[number];

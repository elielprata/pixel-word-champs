export const GAME_CONSTANTS = {
  // Palavras obrigatórias por nível
  TOTAL_WORDS_REQUIRED: 5,
  
  // Tamanhos do tabuleiro - MUDANÇA: 8x12 (altura x largura)
  BOARD_HEIGHT: 8,
  BOARD_WIDTH: 12,
  
  // Tamanhos das células
  DESKTOP_CELL_SIZE: 28,
  MOBILE_CELL_SIZE: 24,
  
  // Larguras do tabuleiro
  DESKTOP_BOARD_WIDTH: 480, // Aumentado para acomodar 12 colunas
  MOBILE_BOARD_WIDTH: 360,   // Aumentado proporcionalmente
  
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
  
  // Cores gamificadas para palavras encontradas
  WORD_COLORS: [
    'from-red-500 to-red-600', // Vermelho vibrante
    'from-blue-500 to-blue-600', // Azul vibrante
    'from-emerald-500 to-emerald-600', // Verde esmeralda
    'from-amber-500 to-amber-600', // Âmbar dourado
    'from-violet-500 to-violet-600', // Violeta
    'from-cyan-500 to-cyan-600', // Ciano
    'from-lime-500 to-lime-600', // Verde lima
    'from-orange-500 to-orange-600', // Laranja
    'from-pink-500 to-pink-600', // Rosa
    'from-indigo-500 to-indigo-600', // Índigo
  ] as const,

  // Cores de seleção gamificadas
  SELECTION_COLORS: {
    CURRENT: 'from-yellow-400 to-yellow-500',
    HINT: 'from-purple-400 to-purple-500',
    FOUND: 'from-green-400 to-green-500'
  } as const,

  // Temas de fundo gamificados
  BACKGROUND_THEMES: [
    'from-indigo-600 via-purple-600 to-pink-600',
    'from-blue-600 via-cyan-600 to-teal-600',
    'from-purple-600 via-violet-600 to-fuchsia-600',
    'from-green-600 via-emerald-600 to-cyan-600'
  ] as const
};

export type WordColor = typeof GAME_CONSTANTS.WORD_COLORS[number];
export type SelectionColor = typeof GAME_CONSTANTS.SELECTION_COLORS[keyof typeof GAME_CONSTANTS.SELECTION_COLORS];
export type BackgroundTheme = typeof GAME_CONSTANTS.BACKGROUND_THEMES[number];

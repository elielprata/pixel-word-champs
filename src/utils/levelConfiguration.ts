
// Distribuição desejada por dificuldade
export const DIFFICULTY_DISTRIBUTION = {
  easy: 2,    // 2 palavras fáceis
  medium: 1,  // 1 palavra média
  hard: 1,    // 1 palavra difícil
  expert: 1   // 1 palavra expert
};

// Palavras padrão proporcionais ao tamanho do tabuleiro garantindo que cabem
export const getDefaultWordsForSize = (boardSize: number): string[] => {
  const maxLength = Math.min(boardSize - 1, 8);
  
  console.log(`🎯 Gerando palavras padrão para tabuleiro ${boardSize}x${boardSize} (máx ${maxLength} letras)`);
  
  if (boardSize === 5) {
    // Nível 1: 5x5 - palavras até 4 letras
    return ['SOL', 'LUA', 'CASA', 'AMOR'];
  }
  if (boardSize === 6) {
    // Nível 2: 6x6 - palavras até 5 letras
    return ['CÉU', 'MAR', 'TERRA', 'MUNDO', 'TEMPO'];
  }
  if (boardSize === 7) {
    // Nível 3: 7x7 - palavras até 6 letras
    return ['RIO', 'PAZ', 'SONHO', 'AMIGO', 'FLOR'];
  }
  if (boardSize === 8) {
    // Nível 4: 8x8 - palavras até 7 letras
    return ['LUZ', 'FÉ', 'CORAGEM', 'VITÓRIA', 'FAMÍLIA'];
  }
  
  // Para níveis maiores, sempre garantir que as palavras cabem
  const baseWords = ['FIM', 'SIM', 'FLOR', 'ESPERANÇA', 'SABEDORIA', 'AMIZADE', 'LIBERDADE'];
  return baseWords.filter(w => w.length <= maxLength).slice(0, 5);
};

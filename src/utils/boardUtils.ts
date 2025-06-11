export interface Position {
  row: number;
  col: number;
}

export interface PlacedWord {
  word: string;
  startRow: number;
  startCol: number;
  direction: 'horizontal' | 'vertical' | 'diagonal';
  positions: Position[];
}

export const getBoardSize = (level: number): number => {
  // Nível 1: 10x10, Nível 2: 11x11, ..., Nível 11: 20x20
  // A partir do nível 12: 20x20 (fixo)
  if (level <= 11) {
    return 9 + level; // Nível 1 = 10, Nível 2 = 11, ..., Nível 11 = 20
  } else {
    return 20; // Níveis 12+ = 20x20 fixo
  }
};

export const getLevelWords = (level: number): string[] => {
  // Como as palavras não são organizadas por nível, retornamos um array genérico
  // que será preenchido com palavras do banco de dados baseadas na dificuldade
  return [];
};

export const getCellSize = (boardSize: number): number => {
  if (boardSize <= 5) return 42;
  if (boardSize <= 6) return 36;
  if (boardSize <= 7) return 31;
  if (boardSize <= 8) return 27;
  if (boardSize <= 9) return 24;
  if (boardSize <= 10) return 22;
  if (boardSize <= 11) return 20;
  if (boardSize <= 12) return 18;
  if (boardSize <= 14) return 16;
  if (boardSize <= 16) return 14;
  if (boardSize <= 18) return 12;
  if (boardSize <= 20) return 10; // Para tabuleiros 20x20
  return 8; // Para tabuleiros ainda maiores (se necessário)
};

// Esta função agora será substituída pelo hook useGamePointsConfig
// Mantida apenas para compatibilidade
export const getPointsForWord = (word: string): number => {
  console.warn('getPointsForWord deprecated - use useGamePointsConfig hook instead');
  const length = word.length;
  if (length === 3) return 10;
  if (length === 4) return 20;
  if (length === 5) return 30;
  if (length === 6) return 40;
  if (length === 7) return 50;
  return 50 + Math.max(0, length - 7) * 10;
};

// Função para validar se o tabuleiro contém todas as palavras
export const validateBoardContainsWords = (board: string[][], words: string[]): boolean => {
  const size = board.length;
  const directions = [
    { row: 0, col: 1 },   // horizontal
    { row: 1, col: 0 },   // vertical
    { row: 1, col: 1 },   // diagonal
    { row: 0, col: -1 },  // horizontal reversa
    { row: -1, col: 0 },  // vertical reversa
    { row: -1, col: -1 }, // diagonal reversa
    { row: 1, col: -1 },  // diagonal anti
    { row: -1, col: 1 }   // diagonal anti reversa
  ];

  for (const word of words) {
    let found = false;
    
    // Procurar a palavra em todas as posições e direções
    for (let row = 0; row < size && !found; row++) {
      for (let col = 0; col < size && !found; col++) {
        for (const dir of directions) {
          if (checkWordAtPosition(board, word, row, col, dir.row, dir.col, size)) {
            found = true;
            break;
          }
        }
      }
    }
    
    if (!found) {
      console.error(`Palavra "${word}" não encontrada no tabuleiro!`);
      return false;
    }
  }
  
  return true;
};

const checkWordAtPosition = (
  board: string[][], 
  word: string, 
  startRow: number, 
  startCol: number, 
  deltaRow: number, 
  deltaCol: number,
  size: number
): boolean => {
  for (let i = 0; i < word.length; i++) {
    const row = startRow + i * deltaRow;
    const col = startCol + i * deltaCol;
    
    if (row < 0 || row >= size || col < 0 || col >= size) {
      return false;
    }
    
    if (board[row][col] !== word[i]) {
      return false;
    }
  }
  
  return true;
};

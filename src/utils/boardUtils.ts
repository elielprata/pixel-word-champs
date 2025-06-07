
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
  if (level === 1 || level === 2) return 5;
  if (level === 3 || level === 4) return 6;
  if (level === 5 || level === 6) return 7;
  if (level === 7 || level === 8) return 8;
  if (level === 9 || level === 10) return 9;
  return 10;
};

export const getLevelWords = (level: number): string[] => {
  const wordSets = {
    1: ['CASA', 'GATO', 'SOL', 'MAR', 'PAZ'],
    2: ['VIDA', 'AMOR', 'FLOR', 'AZUL', 'FELIZ'],
    3: ['SONHO', 'TERRA', 'VENTO', 'CHUVA', 'FLORES'],
    4: ['ESTRELA', 'MONTANHA', 'OCEANO', 'JARDIM', 'LIBERDADE'],
    5: ['FAMILIA', 'AMIZADE', 'CORAGEM', 'ESPERANCA', 'ALEGRIA'],
    6: ['NATUREZA', 'HARMONIA', 'BELEZA', 'CRIACAO', 'AVENTURA'],
    7: ['DESCOBERTA', 'CONHECIMENTO', 'SABEDORIA', 'PACIENCIA', 'GRATIDAO'],
    8: ['INSPIRACAO', 'TRANSFORMACAO', 'PERSEVERANCA', 'DETERMINACAO', 'SUPERACAO'],
    9: ['ORIGINALIDADE', 'CRIATIVIDADE', 'INOVACAO', 'EXCELENCIA', 'REALIZACAO'],
    10: ['EXTRAORDINARIO', 'MAGNIFICENCIA', 'TRANSCENDENCIA', 'REVOLUCIONARIO', 'INCOMPARAVEL']
  };
  
  const defaultWords = ['PALAVRA', 'TESTE', 'JOGO', 'NIVEL', 'DESAFIO'];
  return wordSets[level as keyof typeof wordSets] || defaultWords;
};

export const getCellSize = (boardSize: number): number => {
  if (boardSize <= 5) return 45;
  if (boardSize <= 6) return 38;
  if (boardSize <= 7) return 33;
  if (boardSize <= 8) return 29;
  if (boardSize <= 9) return 26;
  return 23;
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


import { GAME_CONSTANTS } from '@/constants/game';

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

// ATUALIZADO: Retorna altura do tabuleiro (12)
export const getBoardSize = (level: number): number => {
  return GAME_CONSTANTS.BOARD_HEIGHT;
};

// ATUALIZADO: Retorna altura do tabuleiro para mobile (12)
export const getMobileBoardSize = (level: number): number => {
  return GAME_CONSTANTS.BOARD_HEIGHT;
};

// ATUALIZADO: Retorna largura do tabuleiro (8)
export const getBoardWidth = (level: number): number => {
  return GAME_CONSTANTS.BOARD_WIDTH;
};

// ATUALIZADO: Retorna largura do tabuleiro para mobile (8)
export const getMobileBoardWidth = (level: number): number => {
  return GAME_CONSTANTS.BOARD_WIDTH;
};

export const getLevelWords = (level: number): string[] => {
  return [];
};

export const getCellSize = (boardSize: number, isMobile: boolean = false): number => {
  return isMobile ? GAME_CONSTANTS.MOBILE_CELL_SIZE : GAME_CONSTANTS.DESKTOP_CELL_SIZE;
};

// DEPRECATED - usar useGamePointsConfig hook
export const getPointsForWord = (word: string): number => {
  console.warn('⚠️ getPointsForWord deprecated - use useGamePointsConfig hook instead');
  
  const length = word.length;
  if (length <= 7) {
    return GAME_CONSTANTS.POINTS_BY_LENGTH[length as keyof typeof GAME_CONSTANTS.POINTS_BY_LENGTH] || 50;
  }
  return 50 + Math.max(0, length - 7) * 10;
};

// ATUALIZADO: Função para validar se o tabuleiro contém todas as palavras (agora 12x8)
export const validateBoardContainsWords = (board: string[][], words: string[]): boolean => {
  const height = board.length; // 12
  const width = board[0]?.length || 0; // 8
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
    for (let row = 0; row < height && !found; row++) {
      for (let col = 0; col < width && !found; col++) {
        for (const dir of directions) {
          if (checkWordAtPosition(board, word, row, col, dir.row, dir.col, height, width)) {
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

// ATUALIZADO: Função que agora considera altura e largura separadamente
const checkWordAtPosition = (
  board: string[][], 
  word: string, 
  startRow: number, 
  startCol: number, 
  deltaRow: number, 
  deltaCol: number,
  height: number,
  width: number
): boolean => {
  for (let i = 0; i < word.length; i++) {
    const row = startRow + i * deltaRow;
    const col = startCol + i * deltaCol;
    
    if (row < 0 || row >= height || col < 0 || col >= width) {
      return false;
    }
    
    if (board[row][col] !== word[i]) {
      return false;
    }
  }
  
  return true;
};

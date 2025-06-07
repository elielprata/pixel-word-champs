
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

export const getPointsForWord = (word: string): number => {
  const length = word.length;
  if (length === 3) return 10;
  if (length === 4) return 20;
  if (length === 5) return 30;
  if (length === 6) return 40;
  if (length === 7) return 50;
  return 50 + Math.max(0, length - 7) * 10;
};

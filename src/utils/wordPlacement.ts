
import { type Position, type PlacedWord } from '@/utils/boardUtils';
import { logger } from '@/utils/logger';

export interface WordPlacementResult {
  board: string[][];
  placedWords: PlacedWord[];
}

export class WordPlacer {
  private board: string[][];
  private size: number;
  private placedWords: PlacedWord[] = [];

  constructor(size: number) {
    this.size = size;
    this.board = Array(size).fill(null).map(() => Array(size).fill(''));
  }

  canPlaceWord(word: string, startRow: number, startCol: number, direction: 'horizontal' | 'vertical' | 'diagonal'): boolean {
    const positions = this.getWordPositions(word, startRow, startCol, direction);
    
    // Verificar se todas as posições estão dentro dos limites
    if (!positions.every(pos => pos.row >= 0 && pos.row < this.size && pos.col >= 0 && pos.col < this.size)) {
      return false;
    }
    
    // Verificar conflitos com letras existentes
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const existingLetter = this.board[pos.row][pos.col];
      
      // Se há uma letra e não é a mesma, há conflito
      if (existingLetter !== '' && existingLetter !== word[i]) {
        return false;
      }
    }
    
    return true;
  }

  placeWord(word: string, startRow: number, startCol: number, direction: 'horizontal' | 'vertical' | 'diagonal'): Position[] {
    const positions = this.getWordPositions(word, startRow, startCol, direction);
    
    // Colocar cada letra da palavra no tabuleiro
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      this.board[pos.row][pos.col] = word[i];
    }

    // Adicionar à lista de palavras colocadas
    this.placedWords.push({
      word,
      startRow,
      startCol,
      direction,
      positions
    });
    
    logger.log(`📍 Palavra "${word}" colocada em ${direction} (${startRow}, ${startCol})`);
    return positions;
  }

  // Nova função para tentar colocar palavra priorizando o centro
  tryPlaceWordCentered(word: string): boolean {
    logger.log(`🎯 Tentando colocar palavra "${word}" no centro do tabuleiro...`);
    
    // Calcular área central (terço médio do tabuleiro)
    const centerStart = Math.floor(this.size * 0.33);
    const centerEnd = Math.floor(this.size * 0.67);
    
    // Gerar posições centrais ordenadas por proximidade ao centro absoluto
    const centerPositions = this.generateCenteredPositions(centerStart, centerEnd);
    
    // Tentar colocar a palavra nas posições centrais primeiro
    for (const { row, col } of centerPositions) {
      // Tentar horizontalmente
      if (col + word.length <= this.size) {
        if (this.canPlaceWord(word, row, col, 'horizontal')) {
          this.placeWord(word, row, col, 'horizontal');
          logger.log(`✅ "${word}" colocada horizontalmente no centro em (${row}, ${col})`);
          return true;
        }
      }
      
      // Tentar verticalmente
      if (row + word.length <= this.size) {
        if (this.canPlaceWord(word, row, col, 'vertical')) {
          this.placeWord(word, row, col, 'vertical');
          logger.log(`✅ "${word}" colocada verticalmente no centro em (${row}, ${col})`);
          return true;
        }
      }
      
      // Tentar diagonalmente
      if (row + word.length <= this.size && col + word.length <= this.size) {
        if (this.canPlaceWord(word, row, col, 'diagonal')) {
          this.placeWord(word, row, col, 'diagonal');
          logger.log(`✅ "${word}" colocada diagonalmente no centro em (${row}, ${col})`);
          return true;
        }
      }
    }
    
    logger.log(`⚠️ Não foi possível colocar "${word}" no centro, tentando em toda área...`);
    return false;
  }

  // Gerar posições ordenadas por proximidade ao centro
  private generateCenteredPositions(centerStart: number, centerEnd: number): Array<{row: number, col: number}> {
    const positions: Array<{row: number, col: number, distance: number}> = [];
    const absoluteCenter = Math.floor(this.size / 2);
    
    for (let row = centerStart; row <= centerEnd; row++) {
      for (let col = centerStart; col <= centerEnd; col++) {
        // Calcular distância ao centro absoluto
        const distance = Math.sqrt(Math.pow(row - absoluteCenter, 2) + Math.pow(col - absoluteCenter, 2));
        positions.push({ row, col, distance });
      }
    }
    
    // Ordenar por distância ao centro (mais próximo primeiro)
    return positions
      .sort((a, b) => a.distance - b.distance)
      .map(({ row, col }) => ({ row, col }));
  }

  private getWordPositions(word: string, startRow: number, startCol: number, direction: 'horizontal' | 'vertical' | 'diagonal'): Position[] {
    const positions: Position[] = [];
    
    for (let i = 0; i < word.length; i++) {
      let row = startRow;
      let col = startCol;
      
      switch (direction) {
        case 'horizontal':
          col += i;
          break;
        case 'vertical':
          row += i;
          break;
        case 'diagonal':
          row += i;
          col += i;
          break;
      }
      
      positions.push({ row, col });
    }
    
    return positions;
  }

  getResult(): WordPlacementResult {
    return {
      board: this.board.map(row => [...row]),
      placedWords: [...this.placedWords]
    };
  }

  getBoard(): string[][] {
    return this.board;
  }

  getPlacedWords(): PlacedWord[] {
    return this.placedWords;
  }
}

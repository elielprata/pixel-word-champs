
import { type Position, type PlacedWord } from '@/utils/boardUtils';

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
    
    console.log(`📍 Palavra "${word}" colocada em ${direction} (${startRow}, ${startCol})`);
    return positions;
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

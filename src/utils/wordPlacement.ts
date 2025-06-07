
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
    
    // Check if all positions are within bounds
    if (!positions.every(pos => pos.row >= 0 && pos.row < this.size && pos.col >= 0 && pos.col < this.size)) {
      return false;
    }
    
    // Check for conflicts with existing letters
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const existingLetter = this.board[pos.row][pos.col];
      
      if (existingLetter !== '' && existingLetter !== word[i]) {
        return false;
      }
    }
    
    return true;
  }

  placeWord(word: string, startRow: number, startCol: number, direction: 'horizontal' | 'vertical' | 'diagonal'): Position[] {
    const positions = this.getWordPositions(word, startRow, startCol, direction);
    
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      this.board[pos.row][pos.col] = word[i];
    }

    this.placedWords.push({
      word,
      startRow,
      startCol,
      direction,
      positions
    });
    
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

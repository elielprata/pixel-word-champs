
import { WordPlacer, type WordPlacementResult } from './wordPlacement';
import { type Position } from '@/utils/boardUtils';

export class BoardGenerator {
  static generateSmartBoard(size: number, words: string[]): WordPlacementResult {
    let attempts = 0;
    const maxBoardAttempts = 5;
    
    while (attempts < maxBoardAttempts) {
      attempts++;
      console.log(`Tentativa ${attempts} de gerar o tabuleiro`);
      
      const result = this.generateSingleBoard(size, words);
      
      if (result.placedWords.length === words.length) {
        console.log(`✅ Tabuleiro gerado com sucesso! Todas as ${words.length} palavras foram colocadas.`);
        this.fillEmptySpaces(result.board, size);
        return result;
      } else {
        console.warn(`⚠️ Tentativa ${attempts} falhou. Colocadas: ${result.placedWords.length}/${words.length} palavras`);
      }
    }
    
    console.log('🔄 Usando método de força bruta para garantir todas as palavras...');
    return this.generateBruteForceBoard(size, words);
  }

  private static generateSingleBoard(size: number, words: string[]): WordPlacementResult {
    const wordPlacer = new WordPlacer(size);
    const directions: Array<'horizontal' | 'vertical' | 'diagonal'> = ['horizontal', 'vertical', 'diagonal'];
    
    // Sort words by length (largest first for better space utilization)
    const sortedWords = [...words].sort((a, b) => b.length - a.length);
    
    for (const word of sortedWords) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 300;
      
      while (!placed && attempts < maxAttempts) {
        attempts++;
        
        // Shuffle directions
        const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
        
        for (const direction of shuffledDirections) {
          const { maxRow, maxCol } = this.getDirectionLimits(direction, size, word.length);
          
          if (maxRow <= 0 || maxCol <= 0) continue;
          
          // Try multiple positions
          for (let posAttempt = 0; posAttempt < 50; posAttempt++) {
            const startRow = Math.floor(Math.random() * maxRow);
            const startCol = Math.floor(Math.random() * maxCol);
            
            if (wordPlacer.canPlaceWord(word, startRow, startCol, direction)) {
              wordPlacer.placeWord(word, startRow, startCol, direction);
              placed = true;
              break;
            }
          }
          
          if (placed) break;
        }
      }
      
      if (!placed) {
        console.warn(`Não foi possível colocar a palavra: ${word}`);
        break;
      }
    }
    
    return wordPlacer.getResult();
  }

  private static generateBruteForceBoard(size: number, words: string[]): WordPlacementResult {
    const wordPlacer = new WordPlacer(size);
    const directions: Array<'horizontal' | 'vertical' | 'diagonal'> = ['horizontal', 'vertical', 'diagonal'];
    
    for (const word of words) {
      let placed = false;
      
      for (const direction of directions) {
        if (placed) break;
        
        const { maxRow, maxCol } = this.getDirectionLimits(direction, size, word.length);
        
        if (maxRow <= 0 || maxCol <= 0) continue;
        
        for (let row = 0; row < maxRow && !placed; row++) {
          for (let col = 0; col < maxCol && !placed; col++) {
            if (wordPlacer.canPlaceWord(word, row, col, direction)) {
              wordPlacer.placeWord(word, row, col, direction);
              placed = true;
              console.log(`✅ Palavra "${word}" colocada com força bruta em ${direction}`);
            }
          }
        }
      }
      
      if (!placed) {
        console.error(`❌ ERRO CRÍTICO: Não foi possível colocar a palavra "${word}" mesmo com força bruta!`);
      }
    }
    
    const result = wordPlacer.getResult();
    this.fillEmptySpaces(result.board, size);
    
    console.log(`🎯 Resultado final: ${result.placedWords.length}/${words.length} palavras colocadas`);
    return result;
  }

  private static getDirectionLimits(direction: 'horizontal' | 'vertical' | 'diagonal', size: number, wordLength: number) {
    switch (direction) {
      case 'horizontal':
        return { maxRow: size, maxCol: size - wordLength + 1 };
      case 'vertical':
        return { maxRow: size - wordLength + 1, maxCol: size };
      case 'diagonal':
        return { maxRow: size - wordLength + 1, maxCol: size - wordLength + 1 };
      default:
        return { maxRow: 0, maxCol: 0 };
    }
  }

  private static fillEmptySpaces(board: string[][], size: number): void {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] === '') {
          board[row][col] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
  }
}

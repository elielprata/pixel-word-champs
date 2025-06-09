
import { WordPlacer, type WordPlacementResult } from './wordPlacement';
import { type Position } from '@/utils/boardUtils';

export class BoardGenerator {
  static generateSmartBoard(size: number, words: string[]): WordPlacementResult {
    // Se não há palavras, retorna tabuleiro vazio
    if (words.length === 0) {
      return {
        board: Array(size).fill(null).map(() => Array(size).fill('')),
        placedWords: []
      };
    }

    console.log(`🎯 Gerando tabuleiro ${size}x${size} para palavras:`, words);
    
    // Filtrar palavras que cabem no tabuleiro
    const validWords = words.filter(word => word.length <= size);
    console.log(`📝 Palavras válidas (que cabem no tabuleiro):`, validWords);
    
    if (validWords.length === 0) {
      console.warn('⚠️ Nenhuma palavra cabe no tabuleiro atual');
      return {
        board: Array(size).fill(null).map(() => Array(size).fill('')),
        placedWords: []
      };
    }

    let bestResult: WordPlacementResult = { board: [], placedWords: [] };
    let maxWordsPlaced = 0;
    
    // Tentar várias vezes para encontrar a melhor colocação
    for (let attempt = 1; attempt <= 10; attempt++) {
      const result = this.generateSingleBoard(size, validWords);
      
      if (result.placedWords.length > maxWordsPlaced) {
        maxWordsPlaced = result.placedWords.length;
        bestResult = result;
      }
      
      // Se conseguiu colocar todas as palavras, pare
      if (result.placedWords.length === validWords.length) {
        console.log(`✅ Sucesso na tentativa ${attempt}! Todas as ${validWords.length} palavras colocadas.`);
        break;
      }
    }
    
    console.log(`🎯 Melhor resultado: ${bestResult.placedWords.length}/${validWords.length} palavras colocadas`);
    this.fillEmptySpaces(bestResult.board, size);
    return bestResult;
  }

  private static generateSingleBoard(size: number, words: string[]): WordPlacementResult {
    const wordPlacer = new WordPlacer(size);
    const directions: Array<'horizontal' | 'vertical' | 'diagonal'> = ['horizontal', 'vertical', 'diagonal'];
    
    // Ordenar palavras por tamanho (menores primeiro para melhor aproveitamento)
    const sortedWords = [...words].sort((a, b) => a.length - b.length);
    
    for (const word of sortedWords) {
      let placed = false;
      const maxAttempts = 100;
      
      // Embaralhar direções para variedade
      const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
      
      for (let attempt = 0; attempt < maxAttempts && !placed; attempt++) {
        for (const direction of shuffledDirections) {
          const { maxRow, maxCol } = this.getDirectionLimits(direction, size, word.length);
          
          if (maxRow <= 0 || maxCol <= 0) continue;
          
          const startRow = Math.floor(Math.random() * maxRow);
          const startCol = Math.floor(Math.random() * maxCol);
          
          if (wordPlacer.canPlaceWord(word, startRow, startCol, direction)) {
            wordPlacer.placeWord(word, startRow, startCol, direction);
            placed = true;
            console.log(`✅ "${word}" colocada em ${direction} (${startRow},${startCol})`);
            break;
          }
        }
      }
      
      if (!placed) {
        console.warn(`⚠️ Não foi possível colocar "${word}" - tentando próxima palavra`);
      }
    }
    
    return wordPlacer.getResult();
  }

  private static getDirectionLimits(direction: 'horizontal' | 'vertical' | 'diagonal', size: number, wordLength: number) {
    switch (direction) {
      case 'horizontal':
        return { maxRow: size, maxCol: Math.max(1, size - wordLength + 1) };
      case 'vertical':
        return { maxRow: Math.max(1, size - wordLength + 1), maxCol: size };
      case 'diagonal':
        return { maxRow: Math.max(1, size - wordLength + 1), maxCol: Math.max(1, size - wordLength + 1) };
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

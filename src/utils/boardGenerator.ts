
import { WordPlacer, type WordPlacementResult } from './wordPlacement';
import { type Position } from '@/utils/boardUtils';

export class BoardGenerator {
  static generateSmartBoard(size: number, words: string[]): WordPlacementResult {
    console.log(`🚀 Iniciando geração do tabuleiro ${size}x${size} com palavras:`, words);
    
    let attempts = 0;
    const maxBoardAttempts = 5;
    
    while (attempts < maxBoardAttempts) {
      attempts++;
      console.log(`Tentativa ${attempts} de gerar o tabuleiro ${size}x${size}`);
      
      const result = this.generateSingleBoard(size, words);
      
      if (result.placedWords.length >= Math.min(3, words.length)) {
        console.log(`✅ Tabuleiro gerado com sucesso! ${result.placedWords.length}/${words.length} palavras colocadas.`);
        this.fillEmptySpaces(result.board, size);
        console.log('🎲 Tabuleiro final:', result.board);
        return result;
      } else {
        console.warn(`⚠️ Tentativa ${attempts} falhou. Colocadas: ${result.placedWords.length}/${words.length} palavras`);
      }
    }
    
    console.log('🔄 Usando método garantido...');
    return this.generateGuaranteedBoard(size, words);
  }

  private static generateSingleBoard(size: number, words: string[]): WordPlacementResult {
    const wordPlacer = new WordPlacer(size);
    const directions: Array<'horizontal' | 'vertical' | 'diagonal'> = ['horizontal', 'vertical', 'diagonal'];
    
    // Ordenar palavras por tamanho (menores primeiro para tabuleiros pequenos)
    const sortedWords = [...words].sort((a, b) => {
      if (size <= 6) return a.length - b.length; // Palavras menores primeiro em tabuleiros pequenos
      return b.length - a.length; // Palavras maiores primeiro em tabuleiros grandes
    });
    
    for (const word of sortedWords) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = size * size * 2;
      
      while (!placed && attempts < maxAttempts) {
        attempts++;
        
        // Embaralhar direções
        const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
        
        for (const direction of shuffledDirections) {
          const { maxRow, maxCol } = this.getDirectionLimits(direction, size, word.length);
          
          if (maxRow <= 0 || maxCol <= 0) continue;
          
          const startRow = Math.floor(Math.random() * maxRow);
          const startCol = Math.floor(Math.random() * maxCol);
          
          if (wordPlacer.canPlaceWord(word, startRow, startCol, direction)) {
            wordPlacer.placeWord(word, startRow, startCol, direction);
            placed = true;
            console.log(`✅ Palavra "${word}" colocada em ${direction} na posição (${startRow}, ${startCol})`);
            break;
          }
        }
        
        if (placed) break;
      }
      
      if (!placed) {
        console.warn(`❌ Não foi possível colocar a palavra: ${word}`);
      }
    }
    
    return wordPlacer.getResult();
  }

  private static generateGuaranteedBoard(size: number, words: string[]): WordPlacementResult {
    const wordPlacer = new WordPlacer(size);
    const directions: Array<'horizontal' | 'vertical' | 'diagonal'> = ['horizontal', 'vertical'];
    
    console.log('🛡️ Método garantido: colocando palavras uma por uma...');
    
    for (let i = 0; i < words.length && i < 5; i++) {
      const word = words[i];
      let placed = false;
      
      // Tentar colocar horizontalmente primeiro
      for (let row = 0; row < size && !placed; row++) {
        for (let col = 0; col <= size - word.length && !placed; col++) {
          if (wordPlacer.canPlaceWord(word, row, col, 'horizontal')) {
            wordPlacer.placeWord(word, row, col, 'horizontal');
            placed = true;
            console.log(`✅ Palavra "${word}" colocada horizontalmente garantida em (${row}, ${col})`);
          }
        }
      }
      
      // Se não colocou horizontalmente, tentar verticalmente
      if (!placed) {
        for (let row = 0; row <= size - word.length && !placed; row++) {
          for (let col = 0; col < size && !placed; col++) {
            if (wordPlacer.canPlaceWord(word, row, col, 'vertical')) {
              wordPlacer.placeWord(word, row, col, 'vertical');
              placed = true;
              console.log(`✅ Palavra "${word}" colocada verticalmente garantida em (${row}, ${col})`);
            }
          }
        }
      }
      
      if (!placed) {
        console.error(`❌ ERRO: Não foi possível colocar "${word}" mesmo com método garantido`);
      }
    }
    
    const result = wordPlacer.getResult();
    this.fillEmptySpaces(result.board, size);
    
    console.log(`🎯 Resultado garantido: ${result.placedWords.length}/${words.length} palavras colocadas`);
    return result;
  }

  private static getDirectionLimits(direction: 'horizontal' | 'vertical' | 'diagonal', size: number, wordLength: number) {
    switch (direction) {
      case 'horizontal':
        return { maxRow: size, maxCol: Math.max(1, size - wordLength + 1) };
      case 'vertical':
        return { maxRow: Math.max(1, size - wordLength + 1), maxCol: size };
      case 'diagonal':
        return { 
          maxRow: Math.max(1, size - wordLength + 1), 
          maxCol: Math.max(1, size - wordLength + 1) 
        };
      default:
        return { maxRow: 0, maxCol: 0 };
    }
  }

  private static fillEmptySpaces(board: string[][], size: number): void {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let filledCount = 0;
    
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] === '' || board[row][col] === undefined) {
          board[row][col] = letters[Math.floor(Math.random() * letters.length)];
          filledCount++;
        }
      }
    }
    
    console.log(`🔤 Preenchidas ${filledCount} células vazias com letras aleatórias`);
  }
}

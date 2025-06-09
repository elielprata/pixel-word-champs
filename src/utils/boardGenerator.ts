
import { WordPlacer, type WordPlacementResult } from './wordPlacement';
import { type Position } from '@/utils/boardUtils';

export class BoardGenerator {
  static generateSmartBoard(size: number, words: string[]): WordPlacementResult {
    let attempts = 0;
    const maxBoardAttempts = 8; // Aumentar tentativas para tabuleiros maiores
    
    while (attempts < maxBoardAttempts) {
      attempts++;
      console.log(`Tentativa ${attempts} de gerar o tabuleiro ${size}x${size}`);
      
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
    
    // Ordenar palavras por tamanho (maiores primeiro para melhor utilização do espaço)
    const sortedWords = [...words].sort((a, b) => b.length - a.length);
    
    for (const word of sortedWords) {
      let placed = false;
      let attempts = 0;
      // Aumentar tentativas proporcionalmente ao tamanho do tabuleiro
      const maxAttempts = Math.min(500, size * size * 10);
      
      while (!placed && attempts < maxAttempts) {
        attempts++;
        
        // Embaralhar direções para variedade
        const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
        
        for (const direction of shuffledDirections) {
          const { maxRow, maxCol } = this.getDirectionLimits(direction, size, word.length);
          
          if (maxRow <= 0 || maxCol <= 0) continue;
          
          // Tentar múltiplas posições com distribuição mais inteligente
          const positionAttempts = Math.min(100, maxRow * maxCol);
          for (let posAttempt = 0; posAttempt < positionAttempts; posAttempt++) {
            const startRow = Math.floor(Math.random() * maxRow);
            const startCol = Math.floor(Math.random() * maxCol);
            
            if (wordPlacer.canPlaceWord(word, startRow, startCol, direction)) {
              wordPlacer.placeWord(word, startRow, startCol, direction);
              placed = true;
              console.log(`✅ Palavra "${word}" (${word.length} letras) colocada em ${direction}`);
              break;
            }
          }
          
          if (placed) break;
        }
      }
      
      if (!placed) {
        console.warn(`❌ Não foi possível colocar a palavra: ${word} (${word.length} letras)`);
        break;
      }
    }
    
    return wordPlacer.getResult();
  }

  private static generateBruteForceBoard(size: number, words: string[]): WordPlacementResult {
    const wordPlacer = new WordPlacer(size);
    const directions: Array<'horizontal' | 'vertical' | 'diagonal'> = ['horizontal', 'vertical', 'diagonal'];
    
    // Ordenar por tamanho para colocar palavras maiores primeiro
    const sortedWords = [...words].sort((a, b) => b.length - a.length);
    
    for (const word of sortedWords) {
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
              console.log(`✅ Palavra "${word}" (${word.length} letras) colocada com força bruta em ${direction}`);
            }
          }
        }
      }
      
      if (!placed) {
        console.error(`❌ ERRO CRÍTICO: Não foi possível colocar a palavra "${word}" (${word.length} letras) mesmo com força bruta!`);
        // Em caso de falha, tentar colocar uma versão truncada da palavra
        if (word.length > 3) {
          const truncatedWord = word.substring(0, Math.min(word.length - 1, size - 1));
          console.log(`🔄 Tentando versão truncada: "${truncatedWord}"`);
          
          for (const direction of directions) {
            const { maxRow, maxCol } = this.getDirectionLimits(direction, size, truncatedWord.length);
            
            if (maxRow <= 0 || maxCol <= 0) continue;
            
            for (let row = 0; row < maxRow; row++) {
              for (let col = 0; col < maxCol; col++) {
                if (wordPlacer.canPlaceWord(truncatedWord, row, col, direction)) {
                  wordPlacer.placeWord(truncatedWord, row, col, direction);
                  console.log(`✅ Versão truncada "${truncatedWord}" colocada!`);
                  placed = true;
                  break;
                }
              }
              if (placed) break;
            }
            if (placed) break;
          }
        }
      }
    }
    
    const result = wordPlacer.getResult();
    this.fillEmptySpaces(result.board, size);
    
    console.log(`🎯 Resultado final: ${result.placedWords.length}/${words.length} palavras colocadas no tabuleiro ${size}x${size}`);
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
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] === '') {
          board[row][col] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
  }
}

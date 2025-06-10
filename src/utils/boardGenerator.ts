
import { WordPlacer, type WordPlacementResult } from './wordPlacement';
import { type Position } from '@/utils/boardUtils';

export class BoardGenerator {
  static generateSmartBoard(size: number, words: string[]): WordPlacementResult {
    console.log(`🚀 Iniciando geração do tabuleiro ${size}x${size} com palavras:`, words);
    
    // Sempre usar método garantido para não falhar
    return this.generateGuaranteedBoard(size, words);
  }

  private static generateGuaranteedBoard(size: number, words: string[]): WordPlacementResult {
    const wordPlacer = new WordPlacer(size);
    
    console.log('🛡️ Método garantido: colocando palavras uma por uma...');
    
    // Ordenar palavras por tamanho (maiores primeiro para melhor colocação)
    const sortedWords = [...words].sort((a, b) => b.length - a.length);
    
    for (let i = 0; i < sortedWords.length; i++) {
      const word = sortedWords[i];
      let placed = false;
      
      // Tentar todas as posições possíveis até conseguir colocar
      for (let row = 0; row < size && !placed; row++) {
        for (let col = 0; col < size && !placed; col++) {
          // Tentar horizontalmente
          if (col + word.length <= size) {
            if (wordPlacer.canPlaceWord(word, row, col, 'horizontal')) {
              wordPlacer.placeWord(word, row, col, 'horizontal');
              placed = true;
              console.log(`✅ Palavra "${word}" colocada horizontalmente em (${row}, ${col})`);
              continue;
            }
          }
          
          // Tentar verticalmente
          if (row + word.length <= size) {
            if (wordPlacer.canPlaceWord(word, row, col, 'vertical')) {
              wordPlacer.placeWord(word, row, col, 'vertical');
              placed = true;
              console.log(`✅ Palavra "${word}" colocada verticalmente em (${row}, ${col})`);
              continue;
            }
          }
          
          // Tentar diagonalmente
          if (row + word.length <= size && col + word.length <= size) {
            if (wordPlacer.canPlaceWord(word, row, col, 'diagonal')) {
              wordPlacer.placeWord(word, row, col, 'diagonal');
              placed = true;
              console.log(`✅ Palavra "${word}" colocada diagonalmente em (${row}, ${col})`);
              continue;
            }
          }
        }
      }
      
      if (!placed) {
        console.error(`❌ CRÍTICO: Não foi possível colocar "${word}" no tabuleiro ${size}x${size}`);
        // Se uma palavra não couber, tentar com tabuleiro maior
        if (size < 12) {
          console.log(`🔄 Tentando com tabuleiro maior...`);
          return this.generateGuaranteedBoard(size + 1, words);
        }
      }
    }
    
    const result = wordPlacer.getResult();
    this.fillEmptySpaces(result.board, size);
    
    console.log(`🎯 Resultado final: ${result.placedWords.length}/${words.length} palavras colocadas`);
    
    // Verificar se todas as palavras foram colocadas
    if (result.placedWords.length < words.length) {
      console.error(`❌ ERRO CRÍTICO: Apenas ${result.placedWords.length}/${words.length} palavras foram colocadas!`);
    }
    
    return result;
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

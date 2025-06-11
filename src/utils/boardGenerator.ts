
import { WordPlacer, type WordPlacementResult } from './wordPlacement';
import { type Position } from '@/utils/boardUtils';

export class BoardGenerator {
  static generateSmartBoard(size: number, words: string[]): WordPlacementResult {
    console.log(`🚀 Iniciando geração do tabuleiro ${size}x${size} com palavras:`, words);
    
    // Validar palavras antes de tentar colocar no tabuleiro
    const validWords = words.filter(word => {
      if (!word || typeof word !== 'string') {
        console.warn(`⚠️ Palavra inválida (não é string):`, word);
        return false;
      }
      
      if (word.length > size) {
        console.warn(`⚠️ Palavra "${word}" (${word.length} letras) muito grande para tabuleiro ${size}x${size}`);
        return false;
      }
      
      if (word.length < 3) {
        console.warn(`⚠️ Palavra "${word}" muito pequena (mínimo 3 letras)`);
        return false;
      }
      
      if (!/^[A-Z]+$/.test(word)) {
        console.warn(`⚠️ Palavra "${word}" contém caracteres inválidos`);
        return false;
      }
      
      return true;
    });
    
    if (validWords.length === 0) {
      console.error(`❌ CRÍTICO: Nenhuma palavra válida para tabuleiro ${size}x${size}`);
      return {
        board: Array(size).fill(null).map(() => Array(size).fill('')),
        placedWords: []
      };
    }
    
    if (validWords.length !== words.length) {
      console.log(`🔄 Usando ${validWords.length}/${words.length} palavras válidas:`, validWords);
    }
    
    return this.generateGuaranteedBoard(size, validWords);
  }

  private static generateGuaranteedBoard(size: number, words: string[]): WordPlacementResult {
    const wordPlacer = new WordPlacer(size);
    
    console.log('🛡️ Método garantido: colocando palavras uma por uma...');
    
    // Ordenar palavras por tamanho (maiores primeiro para melhor colocação)
    const sortedWords = [...words].sort((a, b) => b.length - a.length);
    let placedCount = 0;
    
    for (let i = 0; i < sortedWords.length; i++) {
      const word = sortedWords[i].toUpperCase();
      let placed = false;
      
      console.log(`🎯 Tentando colocar palavra "${word}" (${word.length} letras)...`);
      
      // Tentar todas as posições possíveis até conseguir colocar
      for (let row = 0; row < size && !placed; row++) {
        for (let col = 0; col < size && !placed; col++) {
          // Tentar horizontalmente
          if (col + word.length <= size) {
            if (wordPlacer.canPlaceWord(word, row, col, 'horizontal')) {
              wordPlacer.placeWord(word, row, col, 'horizontal');
              placed = true;
              placedCount++;
              console.log(`✅ "${word}" colocada horizontalmente em (${row}, ${col})`);
              continue;
            }
          }
          
          // Tentar verticalmente
          if (row + word.length <= size) {
            if (wordPlacer.canPlaceWord(word, row, col, 'vertical')) {
              wordPlacer.placeWord(word, row, col, 'vertical');
              placed = true;
              placedCount++;
              console.log(`✅ "${word}" colocada verticalmente em (${row}, ${col})`);
              continue;
            }
          }
          
          // Tentar diagonalmente
          if (row + word.length <= size && col + word.length <= size) {
            if (wordPlacer.canPlaceWord(word, row, col, 'diagonal')) {
              wordPlacer.placeWord(word, row, col, 'diagonal');
              placed = true;
              placedCount++;
              console.log(`✅ "${word}" colocada diagonalmente em (${row}, ${col})`);
              continue;
            }
          }
        }
      }
      
      if (!placed) {
        console.warn(`⚠️ Não foi possível colocar "${word}" no tabuleiro ${size}x${size}`);
      }
    }
    
    const result = wordPlacer.getResult();
    this.fillEmptySpaces(result.board, size);
    
    console.log(`🎯 Resultado final: ${placedCount}/${words.length} palavras colocadas no tabuleiro ${size}x${size}`);
    console.log(`📝 Palavras colocadas:`, result.placedWords.map(pw => pw.word));
    
    // Validar que as palavras no tabuleiro correspondem às palavras solicitadas
    const placedWordsSet = new Set(result.placedWords.map(pw => pw.word));
    const requestedWordsSet = new Set(words.map(w => w.toUpperCase()));
    
    for (const requestedWord of requestedWordsSet) {
      if (!placedWordsSet.has(requestedWord)) {
        console.error(`❌ ERRO: Palavra solicitada "${requestedWord}" não foi colocada no tabuleiro!`);
      }
    }
    
    for (const placedWord of placedWordsSet) {
      if (!requestedWordsSet.has(placedWord)) {
        console.error(`❌ ERRO: Palavra "${placedWord}" foi colocada mas não estava na lista solicitada!`);
      }
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

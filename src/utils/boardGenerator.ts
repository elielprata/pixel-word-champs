
import { WordPlacer, type WordPlacementResult } from './wordPlacement';
import { type Position } from '@/utils/boardUtils';
import { isValidGameWord, normalizeText } from '@/utils/levelConfiguration';
import { logger } from '@/utils/logger';

export class BoardGenerator {
  static generateSmartBoard(size: number, words: string[]): WordPlacementResult {
    logger.log(`🚀 Iniciando geração do tabuleiro ${size}x${size} com palavras:`, words);
    
    // Normalizar e validar palavras antes de tentar colocar no tabuleiro
    const normalizedWords = words
      .map(word => normalizeText(word))
      .filter(word => {
        const isValid = isValidGameWord(word, size);
        if (!isValid) {
          logger.warn(`⚠️ Palavra "${word}" rejeitada na validação`);
        }
        return isValid;
      });
    
    if (normalizedWords.length === 0) {
      logger.error(`❌ CRÍTICO: Nenhuma palavra válida para tabuleiro ${size}x${size}`);
      logger.error(`Original words:`, words);
      
      // Gerar tabuleiro vazio mas funcional
      const emptyBoard = Array(size).fill(null).map(() => 
        Array(size).fill(null).map(() => 
          String.fromCharCode(65 + Math.floor(Math.random() * 26))
        )
      );
      
      return {
        board: emptyBoard,
        placedWords: []
      };
    }
    
    if (normalizedWords.length !== words.length) {
      logger.log(`🔄 Usando ${normalizedWords.length}/${words.length} palavras válidas após normalização:`, normalizedWords);
    }
    
    const result = this.generateCenteredBoard(size, normalizedWords);
    
    // Validar resultado
    if (result.placedWords.length === 0) {
      logger.error(`❌ ERRO: Nenhuma palavra foi colocada no tabuleiro ${size}x${size}`);
      logger.error(`Palavras tentativas:`, normalizedWords);
    } else {
      logger.log(`✅ Tabuleiro gerado com sucesso: ${result.placedWords.length}/${normalizedWords.length} palavras colocadas`);
    }
    
    return result;
  }

  private static generateCenteredBoard(size: number, words: string[]): WordPlacementResult {
    const wordPlacer = new WordPlacer(size);
    
    logger.log('🎯 Método centrado: priorizando colocação no centro do tabuleiro...');
    
    // Ordenar palavras por tamanho (maiores primeiro para melhor colocação)
    const sortedWords = [...words].sort((a, b) => b.length - a.length);
    let placedCount = 0;
    
    for (let i = 0; i < sortedWords.length; i++) {
      const word = sortedWords[i];
      let placed = false;
      
      logger.log(`🎯 Tentando colocar palavra "${word}" (${word.length} letras)...`);
      
      // Primeiro, tentar colocar no centro
      placed = wordPlacer.tryPlaceWordCentered(word);
      
      // Se não conseguiu no centro, tentar em todas as posições (fallback)
      if (!placed) {
        logger.log(`🔄 Tentando colocação tradicional para "${word}"...`);
        
        for (let row = 0; row < size && !placed; row++) {
          for (let col = 0; col < size && !placed; col++) {
            // Tentar horizontalmente
            if (col + word.length <= size) {
              if (wordPlacer.canPlaceWord(word, row, col, 'horizontal')) {
                wordPlacer.placeWord(word, row, col, 'horizontal');
                placed = true;
                logger.log(`✅ "${word}" colocada horizontalmente (fallback) em (${row}, ${col})`);
                continue;
              }
            }
            
            // Tentar verticalmente
            if (row + word.length <= size) {
              if (wordPlacer.canPlaceWord(word, row, col, 'vertical')) {
                wordPlacer.placeWord(word, row, col, 'vertical');
                placed = true;
                logger.log(`✅ "${word}" colocada verticalmente (fallback) em (${row}, ${col})`);
                continue;
              }
            }
            
            // Tentar diagonalmente
            if (row + word.length <= size && col + word.length <= size) {
              if (wordPlacer.canPlaceWord(word, row, col, 'diagonal')) {
                wordPlacer.placeWord(word, row, col, 'diagonal');
                placed = true;
                logger.log(`✅ "${word}" colocada diagonalmente (fallback) em (${row}, ${col})`);
                continue;
              }
            }
          }
        }
      }
      
      if (placed) {
        placedCount++;
      } else {
        logger.warn(`⚠️ Não foi possível colocar "${word}" no tabuleiro ${size}x${size}`);
      }
    }
    
    const result = wordPlacer.getResult();
    this.fillEmptySpaces(result.board, size);
    
    logger.log(`🎯 Resultado final: ${placedCount}/${words.length} palavras colocadas no tabuleiro ${size}x${size}`);
    logger.log(`📝 Palavras colocadas:`, result.placedWords.map(pw => pw.word));
    
    // Validar que as palavras no tabuleiro correspondem às palavras solicitadas
    const placedWordsSet = new Set(result.placedWords.map(pw => pw.word));
    const requestedWordsSet = new Set(words);
    
    for (const requestedWord of requestedWordsSet) {
      if (!placedWordsSet.has(requestedWord)) {
        logger.error(`❌ ERRO: Palavra solicitada "${requestedWord}" não foi colocada no tabuleiro!`);
      }
    }
    
    return result;
  }

  private static fillEmptySpaces(board: string[][], size: number): void {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let filledCount = 0;
    
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] === '' || board[row][col] === undefined || board[row][col] === null) {
          board[row][col] = letters[Math.floor(Math.random() * letters.length)];
          filledCount++;
        }
      }
    }
    
    logger.log(`🔤 Preenchidas ${filledCount} células vazias com letras aleatórias`);
  }
}

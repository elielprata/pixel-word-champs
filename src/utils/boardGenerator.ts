
import { WordPlacer, type WordPlacementResult } from './wordPlacement';
import { type Position, getBoardWidth, getMobileBoardWidth } from '@/utils/boardUtils';
import { isValidGameWord, normalizeText } from '@/utils/levelConfiguration';
import { logger } from '@/utils/logger';

export class BoardGenerator {
  static generateSmartBoard(height: number, words: string[]): WordPlacementResult {
    const width = 8; // largura fixa
    logger.log(`🚀 Iniciando geração do tabuleiro ${height}x${width} com palavras:`, words);
    
    // Normalizar e validar palavras antes de tentar colocar no tabuleiro
    const normalizedWords = words
      .map(word => normalizeText(word))
      .filter(word => {
        const isValid = isValidGameWord(word, Math.min(height, width));
        if (!isValid) {
          logger.warn(`⚠️ Palavra "${word}" rejeitada na validação`);
        }
        return isValid;
      });
    
    if (normalizedWords.length === 0) {
      logger.error(`❌ CRÍTICO: Nenhuma palavra válida para tabuleiro ${height}x${width}`);
      logger.error(`Original words:`, words);
      
      // Gerar tabuleiro vazio mas funcional
      const emptyBoard = Array(height).fill(null).map(() => 
        Array(width).fill(null).map(() => 
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
    
    const result = this.generateCenteredBoard(height, width, normalizedWords);
    
    // Validar resultado
    if (result.placedWords.length === 0) {
      logger.error(`❌ ERRO: Nenhuma palavra foi colocada no tabuleiro ${height}x${width}`);
      logger.error(`Palavras tentativas:`, normalizedWords);
    } else {
      logger.log(`✅ Tabuleiro gerado com sucesso: ${result.placedWords.length}/${normalizedWords.length} palavras colocadas`);
    }
    
    return result;
  }

  private static generateCenteredBoard(height: number, width: number, words: string[]): WordPlacementResult {
    const wordPlacer = new WordPlacer(height, width);
    
    logger.log('🎯 Método centrado: priorizando colocação no centro do tabuleiro 12x8...');
    
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
        
        for (let row = 0; row < height && !placed; row++) {
          for (let col = 0; col < width && !placed; col++) {
            // Tentar horizontalmente
            if (col + word.length <= width) {
              if (wordPlacer.canPlaceWord(word, row, col, 'horizontal')) {
                wordPlacer.placeWord(word, row, col, 'horizontal');
                placed = true;
                logger.log(`✅ "${word}" colocada horizontalmente (fallback) em (${row}, ${col})`);
                continue;
              }
            }
            
            // Tentar verticalmente
            if (row + word.length <= height) {
              if (wordPlacer.canPlaceWord(word, row, col, 'vertical')) {
                wordPlacer.placeWord(word, row, col, 'vertical');
                placed = true;
                logger.log(`✅ "${word}" colocada verticalmente (fallback) em (${row}, ${col})`);
                continue;
              }
            }
            
            // Tentar diagonalmente
            if (row + word.length <= height && col + word.length <= width) {
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
        logger.warn(`⚠️ Não foi possível colocar "${word}" no tabuleiro ${height}x${width}`);
      }
    }
    
    const result = wordPlacer.getResult();
    this.fillEmptySpaces(result.board, height, width);
    
    logger.log(`🎯 Resultado final: ${placedCount}/${words.length} palavras colocadas no tabuleiro ${height}x${width}`);
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

  private static fillEmptySpaces(board: string[][], height: number, width: number): void {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let filledCount = 0;
    
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        if (board[row][col] === '' || board[row][col] === undefined || board[row][col] === null) {
          board[row][col] = letters[Math.floor(Math.random() * letters.length)];
          filledCount++;
        }
      }
    }
    
    logger.log(`🔤 Preenchidas ${filledCount} células vazias com letras aleatórias`);
  }
}

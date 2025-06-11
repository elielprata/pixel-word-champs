
import { useState, useEffect } from 'react';
import { getBoardSize, type PlacedWord, validateBoardContainsWords } from '@/utils/boardUtils';
import { useWordSelection } from './useWordSelection';
import { useBoardGeneration } from './useBoardGeneration';
import { logger } from '@/utils/logger';

interface BoardData {
  board: string[][];
  placedWords: PlacedWord[];
}

export const useBoard = (level: number) => {
  const [boardData, setBoardData] = useState<BoardData>({ board: [], placedWords: [] });
  const { levelWords, isLoading } = useWordSelection(level);
  const { generateBoard } = useBoardGeneration();

  // Regenerar tabuleiro quando o nível ou palavras mudam
  useEffect(() => {
    if (levelWords.length > 0 && !isLoading) {
      const size = getBoardSize(level);
      
      logger.log(`🎯 Gerando tabuleiro ${size}x${size} para nível ${level} com palavras:`, levelWords);
      
      // Validar que todas as palavras cabem no tabuleiro
      const invalidWords = levelWords.filter(word => word.length > size);
      if (invalidWords.length > 0) {
        logger.error(`❌ ERRO: Palavras muito grandes para o tabuleiro ${size}x${size}:`, invalidWords);
        const validWords = levelWords.filter(word => word.length <= size);
        if (validWords.length > 0) {
          const newBoardData = generateBoard(size, validWords);
          setBoardData(newBoardData);
          logger.log(`🎲 Tabuleiro gerado com ${validWords.length} palavras válidas`);
        }
        return;
      }
      
      // Gerar tabuleiro com todas as palavras
      const newBoardData = generateBoard(size, levelWords);
      setBoardData(newBoardData);
      
      // Validar que o tabuleiro contém todas as palavras solicitadas
      const isValid = validateBoardContainsWords(newBoardData.board, levelWords);
      if (!isValid) {
        logger.error(`❌ VALIDAÇÃO FALHOU: Tabuleiro não contém todas as palavras solicitadas!`);
        logger.log('📝 Palavras solicitadas:', levelWords);
        logger.log('📝 Palavras colocadas:', newBoardData.placedWords.map(pw => pw.word));
      } else {
        logger.log(`✅ Validação OK: Tabuleiro contém todas as ${levelWords.length} palavras solicitadas`);
      }
    }
  }, [level, levelWords, isLoading, generateBoard]);

  const size = getBoardSize(level);

  return {
    boardData,
    size,
    levelWords
  };
};

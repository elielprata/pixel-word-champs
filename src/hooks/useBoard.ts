
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
      
      logger.info('Gerando tabuleiro para nível', { 
        level, 
        size, 
        wordsCount: levelWords.length 
      }, 'USE_BOARD');
      
      // Validar que todas as palavras cabem no tabuleiro
      const invalidWords = levelWords.filter(word => word.length > size);
      if (invalidWords.length > 0) {
        logger.error('Palavras muito grandes para o tabuleiro', { 
          size, 
          invalidWords 
        }, 'USE_BOARD');
        const validWords = levelWords.filter(word => word.length <= size);
        if (validWords.length > 0) {
          const newBoardData = generateBoard(size, validWords);
          setBoardData(newBoardData);
          logger.info('Tabuleiro gerado com palavras válidas', { 
            validWordsCount: validWords.length 
          }, 'USE_BOARD');
        }
        return;
      }
      
      // Gerar tabuleiro com todas as palavras
      const newBoardData = generateBoard(size, levelWords);
      setBoardData(newBoardData);
      
      // Validar que o tabuleiro contém todas as palavras solicitadas
      const isValid = validateBoardContainsWords(newBoardData.board, levelWords);
      if (!isValid) {
        logger.error('Validação do tabuleiro falhou', { 
          requestedWords: levelWords,
          placedWords: newBoardData.placedWords.map(pw => pw.word)
        }, 'USE_BOARD');
      } else {
        logger.info('Tabuleiro validado com sucesso', { 
          wordsCount: levelWords.length 
        }, 'USE_BOARD');
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


import { useState, useEffect } from 'react';
import { getBoardSize, getMobileBoardSize, type PlacedWord, validateBoardContainsWords } from '@/utils/boardUtils';
import { useWordSelection } from './useWordSelection';
import { useBoardGeneration } from './useBoardGeneration';
import { useIsMobile } from './use-mobile';
import { logger } from '@/utils/logger';

interface BoardData {
  board: string[][];
  placedWords: PlacedWord[];
}

export const useBoard = (level: number) => {
  const [boardData, setBoardData] = useState<BoardData>({ board: [], placedWords: [] });
  const [boardError, setBoardError] = useState<string | null>(null);
  const { levelWords, isLoading: wordsLoading, error: wordsError, debugInfo } = useWordSelection(level);
  const { generateBoard } = useBoardGeneration();
  const isMobile = useIsMobile();

  // Regenerar tabuleiro quando o nível ou palavras mudam
  useEffect(() => {
    // Só tentar gerar se não estiver carregando palavras
    if (!wordsLoading) {
      const size = isMobile ? getMobileBoardSize(level) : getBoardSize(level);
      
      logger.info('Iniciando geração do tabuleiro', { 
        level, 
        size, 
        isMobile,
        wordsCount: levelWords.length,
        hasWordsError: !!wordsError
      }, 'USE_BOARD');
      
      try {
        // Sempre gerar um tabuleiro, mesmo sem palavras
        if (levelWords.length === 0) {
          logger.warn('Gerando tabuleiro sem palavras específicas', { 
            level, 
            size,
            isMobile
          }, 'USE_BOARD');
          
          // Gerar com palavras padrão se necessário
          const defaultWords = ['CASA', 'AMOR', 'VIDA', 'TEMPO', 'MUNDO'].filter(w => w.length <= size);
          const newBoardData = generateBoard(size, defaultWords);
          setBoardData(newBoardData);
          setBoardError(null);
          
          logger.info('Tabuleiro gerado com palavras padrão', { 
            wordsPlaced: newBoardData.placedWords.length,
            isMobile
          }, 'USE_BOARD');
          return;
        }
        
        // Validar que todas as palavras cabem no tabuleiro
        const invalidWords = levelWords.filter(word => word.length > size);
        if (invalidWords.length > 0) {
          logger.warn('Palavras muito grandes removidas', { 
            size, 
            invalidWords,
            isMobile
          }, 'USE_BOARD');
          
          const validWords = levelWords.filter(word => word.length <= size);
          if (validWords.length > 0) {
            const newBoardData = generateBoard(size, validWords);
            setBoardData(newBoardData);
            setBoardError(null);
            
            logger.info('Tabuleiro gerado com palavras válidas', { 
              validWordsCount: validWords.length,
              placedWordsCount: newBoardData.placedWords.length,
              isMobile
            }, 'USE_BOARD');
          } else {
            throw new Error('Nenhuma palavra válida para o tabuleiro');
          }
          return;
        }
        
        // Gerar tabuleiro com todas as palavras
        const newBoardData = generateBoard(size, levelWords);
        setBoardData(newBoardData);
        setBoardError(null);
        
        // Validar que o tabuleiro contém todas as palavras solicitadas
        const isValid = validateBoardContainsWords(newBoardData.board, levelWords);
        if (!isValid) {
          logger.error('Validação do tabuleiro falhou', { 
            requestedWords: levelWords,
            placedWords: newBoardData.placedWords.map(pw => pw.word),
            isMobile
          }, 'USE_BOARD');
          setBoardError('Tabuleiro gerado não contém todas as palavras');
        } else {
          logger.info('Tabuleiro validado com sucesso', { 
            wordsCount: levelWords.length,
            placedWordsCount: newBoardData.placedWords.length,
            isMobile
          }, 'USE_BOARD');
        }
        
      } catch (error) {
        logger.error('Erro crítico na geração do tabuleiro', { error, isMobile }, 'USE_BOARD');
        setBoardError(error instanceof Error ? error.message : 'Erro na geração do tabuleiro');
        
        // Fallback: gerar tabuleiro vazio mas funcional
        try {
          const fallbackBoard = Array(size).fill(null).map(() => 
            Array(size).fill(null).map(() => 
              String.fromCharCode(65 + Math.floor(Math.random() * 26))
            )
          );
          
          setBoardData({
            board: fallbackBoard,
            placedWords: []
          });
          
          logger.info('Tabuleiro de fallback gerado', { size, isMobile }, 'USE_BOARD');
        } catch (fallbackError) {
          logger.error('Erro no fallback do tabuleiro', { fallbackError, isMobile }, 'USE_BOARD');
        }
      }
    }
  }, [level, levelWords, wordsLoading, generateBoard, isMobile]);

  const size = isMobile ? getMobileBoardSize(level) : getBoardSize(level);
  const isLoading = wordsLoading || boardData.board.length === 0;
  const error = wordsError || boardError;

  return {
    boardData,
    size,
    levelWords,
    isLoading,
    error,
    debugInfo
  };
};

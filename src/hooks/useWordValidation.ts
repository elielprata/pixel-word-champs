
import { useCallback, useRef } from 'react';
import { type Position } from '@/utils/boardUtils';
import { isLinearPath } from '@/hooks/word-selection/validateLinearPath';
import { logger } from '@/utils/logger';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

interface UseWordValidationProps {
  boardData?: { board: string[][]; placedWords: any[] };
  levelWords: string[];
  foundWords: FoundWord[];
  onWordFound: (foundWord: FoundWord) => void;
  getPointsForWord: (word: string) => number;
}

export const useWordValidation = ({
  boardData,
  levelWords,
  foundWords,
  onWordFound,
  getPointsForWord
}: UseWordValidationProps) => {

  // ✅ PROTEÇÃO ROBUSTA: Lock com timeout
  const isExecutingRef = useRef(false);
  const lastExecutionRef = useRef(0);

  const validateAndConfirmWord = useCallback((selectedPositions: Position[]) => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecutionRef.current;
    
    // ✅ DEBOUNCE: Não executar se foi chamado recentemente (< 200ms)
    if (timeSinceLastExecution < 200) {
      logger.debug('🚫 Validação ignorada - debounce ativo', {
        timeSinceLastExecution,
        positions: selectedPositions
      }, 'WORD_VALIDATION');
      return false;
    }

    // ✅ PROTEÇÃO CRÍTICA: Verificar se já está executando
    if (isExecutingRef.current) {
      logger.warn('🚨 DUPLICAÇÃO EVITADA - validateAndConfirmWord já está executando', {
        positions: selectedPositions,
        timeSinceLastExecution
      }, 'WORD_VALIDATION');
      return false;
    }

    // Marcar como executando
    isExecutingRef.current = true;
    lastExecutionRef.current = now;

    try {
      // Validação 1: Verificar se há posições selecionadas
      if (!selectedPositions || selectedPositions.length < 2) {
        logger.debug('Seleção muito pequena para formar uma palavra', { 
          positionsCount: selectedPositions?.length || 0 
        });
        return false;
      }

      // Validação 2: Verificar se a trajetória é linear
      if (!isLinearPath(selectedPositions)) {
        logger.debug('Trajetória de seleção inválida - não é linear', { 
          positions: selectedPositions 
        });
        return false;
      }

      // Validação 3: Verificar se temos dados do tabuleiro
      if (!boardData?.board) {
        logger.warn('Dados do tabuleiro não disponíveis para validação');
        return false;
      }

      // Extrair a palavra das posições selecionadas
      const word = selectedPositions.map(pos => {
        if (pos.row >= 0 && pos.row < boardData.board.length && 
            pos.col >= 0 && pos.col < boardData.board[pos.row].length) {
          return boardData.board[pos.row][pos.col];
        }
        return '';
      }).join('');

      logger.debug('Palavra extraída da seleção', { 
        word, 
        positions: selectedPositions,
        wordLength: word.length 
      });

      // Validação 4: Verificar se a palavra é válida
      if (!levelWords.includes(word)) {
        logger.debug('Palavra não encontrada na lista do nível', { 
          word, 
          availableWordsCount: levelWords.length
        });
        return false;
      }

      // Validação 5: PROTEÇÃO CRÍTICA - Verificar duplicação
      const alreadyFound = foundWords.some(fw => fw.word === word);
      if (alreadyFound) {
        logger.warn('🚨 DUPLICAÇÃO EVITADA - Palavra já encontrada', { 
          word,
          existingWordsCount: foundWords.length
        });
        return false;
      }

      // ✅ PALAVRA VÁLIDA: Processar uma única vez
      const points = getPointsForWord(word);
      const foundWord: FoundWord = {
        word,
        positions: selectedPositions,
        points
      };

      const wordId = `${word}-${now}`;
      
      logger.info('✅ PALAVRA VÁLIDA CONFIRMADA - PROCESSANDO UMA ÚNICA VEZ', { 
        wordId,
        word, 
        points, 
        positionsCount: selectedPositions.length,
        beforeFoundWordsCount: foundWords.length
      });

      // ✅ CRÍTICO: Chamar callback para adicionar ao estado APENAS UMA VEZ
      onWordFound(foundWord);
      
      logger.info('📝 onWordFound executado com sucesso', {
        wordId,
        word,
        points
      });

      return true;

    } finally {
      // ✅ LIBERAÇÃO COM DELAY: Evitar chamadas múltiplas rapidamente
      setTimeout(() => {
        isExecutingRef.current = false;
        logger.debug('🔓 Lock de validação liberado', {
          word: selectedPositions.length > 0 ? 'processada' : 'vazia'
        });
      }, 300); // Delay maior para proteção adicional
    }

  }, [boardData, levelWords, foundWords, onWordFound, getPointsForWord]);

  return {
    validateAndConfirmWord
  };
};

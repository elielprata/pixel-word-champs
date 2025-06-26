

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

  // CORREÇÃO: Usar useRef ao invés de propriedade da função
  const isExecutingRef = useRef(false);

  const validateAndConfirmWord = useCallback((selectedPositions: Position[]) => {
    // PROTEÇÃO CRÍTICA: Verificar se a função já está sendo executada
    if (isExecutingRef.current) {
      logger.warn('🚨 DUPLICAÇÃO EVITADA - validateAndConfirmWord já está executando', {
        positions: selectedPositions
      }, 'WORD_VALIDATION');
      return false;
    }

    // Marcar como executando
    isExecutingRef.current = true;

    try {
      // Validação 1: Verificar se há posições selecionadas
      if (!selectedPositions || selectedPositions.length < 2) {
        logger.debug('Seleção muito pequena para formar uma palavra', { 
          positionsCount: selectedPositions?.length || 0 
        });
        return false;
      }

      // Validação 2: Verificar se a trajetória é linear (horizontal, vertical ou diagonal)
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

      // Validação 4: Verificar se a palavra é válida (está na lista de palavras do nível)
      if (!levelWords.includes(word)) {
        logger.debug('Palavra não encontrada na lista do nível', { 
          word, 
          availableWords: levelWords 
        });
        return false;
      }

      // Validação 5: PROTEÇÃO CRÍTICA - Verificar se a palavra já foi encontrada
      const alreadyFound = foundWords.some(fw => fw.word === word);
      if (alreadyFound) {
        logger.warn('🚨 DUPLICAÇÃO EVITADA - Palavra já encontrada anteriormente', { 
          word,
          existingWords: foundWords.map(fw => fw.word)
        });
        return false;
      }

      // Se chegou até aqui, a palavra é válida!
      const points = getPointsForWord(word);
      const foundWord: FoundWord = {
        word,
        positions: selectedPositions,
        points
      };

      logger.info('✅ PALAVRA VÁLIDA CONFIRMADA - CHAMANDO onWordFound UMA ÚNICA VEZ', { 
        word, 
        points, 
        positionsCount: selectedPositions.length,
        beforeFoundWordsCount: foundWords.length
      });

      // CRÍTICO: Chamar callback para adicionar ao estado do jogo APENAS UMA VEZ
      onWordFound(foundWord);
      
      logger.info('📝 onWordFound executado com sucesso', {
        word,
        points,
        afterCall: 'Palavra deve ser adicionada ao estado'
      });

      return true;

    } finally {
      // Liberar o lock após um breve delay para evitar chamadas múltiplas
      setTimeout(() => {
        isExecutingRef.current = false;
      }, 100);
    }

  }, [boardData, levelWords, foundWords, onWordFound, getPointsForWord]);

  return {
    validateAndConfirmWord
  };
};


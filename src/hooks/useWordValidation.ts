
import { useCallback } from 'react';
import { type Position } from '@/utils/boardUtils';
import { isLinearPath } from '@/hooks/word-selection/validateLinearPath';
import { logger } from '@/utils/logger';
import { toast } from '@/hooks/use-toast';

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

  const validateAndConfirmWord = useCallback((selectedPositions: Position[]) => {
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
      toast({
        title: "Seleção inválida",
        description: "Selecione palavras apenas na horizontal, vertical ou diagonal",
        variant: "destructive"
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

    // Validação 5: Verificar se a palavra já foi encontrada
    const alreadyFound = foundWords.some(fw => fw.word === word);
    if (alreadyFound) {
      logger.debug('Palavra já foi encontrada anteriormente', { word });
      toast({
        title: "Palavra já encontrada",
        description: `A palavra "${word}" já foi descoberta!`,
        variant: "default"
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

    logger.info('✅ PALAVRA VÁLIDA CONFIRMADA', { 
      word, 
      points, 
      positionsCount: selectedPositions.length 
    });

    // Notificar confirmação com feedback visual
    toast({
      title: "Palavra encontrada! 🎉",
      description: `"${word.toUpperCase()}" = ${points} pontos`,
      variant: "default"
    });

    // Chamar callback para adicionar ao estado do jogo
    onWordFound(foundWord);
    return true;

  }, [boardData, levelWords, foundWords, onWordFound, getPointsForWord]);

  return {
    validateAndConfirmWord
  };
};


import { useCallback, useMemo } from 'react';
import { type Position } from '@/utils/boardUtils';
import { useGamePointsConfig } from './useGamePointsConfig';
import { logger } from '@/utils/logger';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

export const useGameValidation = (
  foundWords: FoundWord[],
  levelWords: string[],
  onWordFound: (word: string, points: number) => void
) => {
  const { getPointsForWord } = useGamePointsConfig();

  // Memoizar set de palavras encontradas para O(1) lookup
  const foundWordsSet = useMemo(() => {
    return new Set(foundWords.map(fw => fw.word));
  }, [foundWords]);

  // Memoizar set de palavras válidas para O(1) lookup
  const levelWordsSet = useMemo(() => {
    return new Set(levelWords);
  }, [levelWords]);

  const isWordAlreadyFound = useCallback((word: string) => {
    return foundWordsSet.has(word);
  }, [foundWordsSet]);

  const isValidWord = useCallback((word: string) => {
    return levelWordsSet.has(word);
  }, [levelWordsSet]);

  const validateAndAddWord = useCallback((word: string, positions: Position[]) => {
    if (isWordAlreadyFound(word)) {
      logger.warn(`Palavra já encontrada: "${word}"`, 'GAME_VALIDATION');
      return null;
    }

    if (!isValidWord(word)) {
      logger.debug(`Palavra inválida: "${word}"`, 'GAME_VALIDATION');
      return null;
    }

    const points = getPointsForWord(word);
    const newFoundWord = { word, positions: [...positions], points };
    
    logger.info(`Palavra validada: "${word}" = ${points} pontos`, 'GAME_VALIDATION');
    onWordFound(word, points);
    
    return newFoundWord;
  }, [isWordAlreadyFound, isValidWord, getPointsForWord, onWordFound]);

  return {
    validateAndAddWord,
    isWordAlreadyFound,
    isValidWord
  };
};


import { useState } from 'react';
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

  const validateAndAddWord = (word: string, positions: Position[]) => {
    // Verificar se é uma palavra válida do nível
    if (!levelWords.includes(word)) {
      logger.warn(`❌ Palavra "${word}" não está na lista do nível`, { word, levelWords }, 'GAME_VALIDATION');
      return null;
    }

    // Verificar se já foi encontrada - PROTEÇÃO CRÍTICA
    const isAlreadyFound = foundWords.some(fw => fw.word === word);
    if (isAlreadyFound) {
      logger.warn(`⚠️ Palavra "${word}" já foi encontrada - IGNORANDO`, { 
        word, 
        foundWords: foundWords.map(fw => fw.word) 
      }, 'GAME_VALIDATION');
      return null;
    }

    const points = getPointsForWord(word);
    const validatedWord = { word, positions: [...positions], points };
    
    logger.info(`✅ Palavra validada: "${word}" = ${points} pontos`, { 
      validatedWord,
      totalFoundWords: foundWords.length + 1 
    }, 'GAME_VALIDATION');
    
    // CORREÇÃO: Removida a chamada duplicada onWordFound(word, points)
    // O callback será chamado apenas pelo useGameState quando addFoundWord for executado
    
    return validatedWord;
  };

  return {
    validateAndAddWord
  };
};

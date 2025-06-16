
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
  levelWords: string[]
) => {
  const { getPointsForWord } = useGamePointsConfig();

  const validateAndAddWord = (word: string, positions: Position[]) => {
    // Verificação 1: Palavra deve estar na lista do nível
    if (!levelWords.includes(word)) {
      logger.warn(`❌ Palavra "${word}" não está na lista do nível`, { word, levelWords }, 'GAME_VALIDATION');
      return null;
    }

    // Verificação 2: Palavra não pode ter sido encontrada antes (PROTEÇÃO CRÍTICA)
    const isAlreadyFound = foundWords.some(fw => fw.word === word);
    if (isAlreadyFound) {
      logger.warn(`⚠️ DUPLICAÇÃO EVITADA - Palavra "${word}" já foi encontrada`, { 
        word, 
        existingWords: foundWords.map(fw => fw.word) 
      }, 'GAME_VALIDATION');
      return null;
    }

    const points = getPointsForWord(word);
    const validatedWord = { word, positions: [...positions], points };
    
    logger.info(`✅ Palavra validada: "${word}" = ${points} pontos`, { 
      validatedWord,
      totalFoundWords: foundWords.length 
    }, 'GAME_VALIDATION');
    
    return validatedWord;
  };

  return { validateAndAddWord };
};

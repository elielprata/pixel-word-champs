
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
    logger.info(`🔍 VALIDAÇÃO INICIADA - Palavra: "${word}"`, { 
      word, 
      existingWords: foundWords.map(fw => fw.word),
      totalFound: foundWords.length 
    }, 'GAME_VALIDATION');

    // Verificação 1: Palavra deve estar na lista do nível
    if (!levelWords.includes(word)) {
      logger.warn(`❌ Palavra "${word}" não está na lista do nível`, { word, levelWords }, 'GAME_VALIDATION');
      return null;
    }

    // Verificação 2: PROTEÇÃO CRÍTICA - Palavra não pode ter sido encontrada antes
    const isAlreadyFound = foundWords.some(fw => fw.word === word);
    if (isAlreadyFound) {
      logger.warn(`⚠️ DUPLICAÇÃO EVITADA NA VALIDAÇÃO - Palavra "${word}" já foi encontrada`, { 
        word, 
        existingWords: foundWords.map(fw => fw.word),
        totalFound: foundWords.length
      }, 'GAME_VALIDATION');
      return null;
    }

    const points = getPointsForWord(word);
    const validatedWord = { word, positions: [...positions], points };
    
    logger.info(`✅ Palavra validada com sucesso: "${word}" = ${points} pontos`, { 
      validatedWord,
      totalFoundWords: foundWords.length 
    }, 'GAME_VALIDATION');
    
    return validatedWord;
  };

  return { validateAndAddWord };
};

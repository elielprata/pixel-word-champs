
import { type Position } from '@/utils/boardUtils';
import { useGamePointsConfig } from './useGamePointsConfig';
import { logger } from '@/utils/logger';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

// HOOK DESATIVADO - A validação agora é feita apenas em useWordValidation
// Este hook está mantido apenas para compatibilidade, mas não executa validação
export const useGameValidation = (
  foundWords: FoundWord[],
  levelWords: string[]
) => {
  const { getPointsForWord } = useGamePointsConfig();

  const validateAndAddWord = (word: string, positions: Position[]) => {
    logger.warn('🚨 useGameValidation DESATIVADO - Validação agora é feita apenas em useWordValidation', { 
      word,
      reason: 'Evitar duplicação de validação e pontuação'
    }, 'GAME_VALIDATION');

    // Retornar null para evitar processamento duplicado
    return null;
  };

  return { validateAndAddWord };
};

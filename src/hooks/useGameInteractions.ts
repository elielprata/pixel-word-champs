
import { type Position } from '@/utils/boardUtils';
import { useUnifiedHintSystem } from './useUnifiedHintSystem';
import { logger } from '@/utils/logger';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

export const useGameInteractions = (
  foundWords: FoundWord[],
  levelWords: string[],
  boardData: { board: string[][]; placedWords: any[] },
  hintsUsed: number,
  setHintsUsed: (value: number | ((prev: number) => number)) => void,
  setHintHighlightedCells: (positions: Position[]) => void,
  canRevive: boolean,
  setCanRevive: (value: boolean) => void,
  setShowGameOver: (value: boolean) => void,
  onTimeUp: () => void
) => {
  // Usar sistema unificado de dicas (sem modal de bloqueio)
  const { useHint } = useUnifiedHintSystem({
    levelWords,
    foundWords,
    boardData,
    hintsUsed,
    setHintsUsed,
    setHintHighlightedCells
  });

  const handleRevive = () => {
    if (!canRevive) return;
    setCanRevive(false);
    setShowGameOver(false);
    logger.info('Revive ativado', { canRevive }, 'GAME_INTERACTIONS');
  };

  const handleGoHome = () => {
    onTimeUp();
  };

  return {
    useHint,
    handleRevive,
    handleGoHome
  };
};

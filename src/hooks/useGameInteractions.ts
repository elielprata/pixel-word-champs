
import { type Position } from '@/utils/boardUtils';
import { toast } from '@/hooks/use-toast';
import { useGamePointsConfig } from './useGamePointsConfig';
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
  const { getPointsForWord } = useGamePointsConfig();

  const useHint = () => {
    if (hintsUsed >= 1) {
      toast({
        title: "Dica indisponível",
        description: "Você já usou sua dica neste nível.",
        variant: "destructive"
      });
      return;
    }

    // Encontrar primeira palavra não encontrada (qualquer uma)
    const hintWord = levelWords.find(
      (word) => !foundWords.some(fw => fw.word === word)
    );

    if (!hintWord) {
      toast({
        title: "Dica indisponível",
        description: "Todas as palavras já foram encontradas!",
        variant: "destructive"
      });
      return;
    }

    setHintsUsed(prev => prev + 1);

    const wordPlacement = boardData.placedWords.find(pw => pw.word === hintWord);

    if (wordPlacement && Array.isArray(wordPlacement.positions)) {
      setHintHighlightedCells(wordPlacement.positions);
      logger.info('Dica utilizada', { word: hintWord, hintsUsed: hintsUsed + 1 }, 'GAME_INTERACTIONS');
      setTimeout(() => {
        setHintHighlightedCells([]);
      }, 3000);
    } else {
      toast({
        title: "Dica não pôde ser aplicada",
        description: "Não foi possível encontrar a posição da palavra no tabuleiro.",
        variant: "destructive"
      });
      logger.warn('Dica não pode ser aplicada (sem positions)', { word: hintWord }, 'GAME_INTERACTIONS');
    }
  };

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

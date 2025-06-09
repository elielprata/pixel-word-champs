
import { type Position } from '@/utils/boardUtils';

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
  const useHint = () => {
    if (hintsUsed >= 1) return;
    
    const remainingWords = levelWords.filter(word => !foundWords.some(fw => fw.word === word));
    if (remainingWords.length > 0) {
      setHintsUsed(prev => prev + 1);
      
      // Encontrar a primeira palavra não encontrada e destacar suas posições
      const hintWord = remainingWords[0];
      const wordPlacement = boardData.placedWords.find(pw => pw.word === hintWord);
      
      if (wordPlacement) {
        setHintHighlightedCells(wordPlacement.positions);
        
        // Remover o destaque após 3 segundos
        setTimeout(() => {
          setHintHighlightedCells([]);
        }, 3000);
      }
      
      console.log(`Dica: Procure por "${hintWord}"`);
    }
  };

  const handleRevive = () => {
    if (!canRevive) return;
    
    // Simular assistir anúncio (em produção seria integrado com sistema de anúncios)
    setCanRevive(false);
    setShowGameOver(false);
    
    // Adicionar 30 segundos (isso seria feito no componente pai)
    console.log('Revive ativado! +30 segundos');
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

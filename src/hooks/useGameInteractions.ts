
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

  // Identificar apenas a palavra com maior pontuação (palavra oculta)
  const getHiddenWords = () => {
    const wordsWithPoints = levelWords.map(word => ({
      word,
      points: getPointsForWord(word)
    }));
    
    const sortedByPoints = [...wordsWithPoints].sort((a, b) => b.points - a.points);
    // Retornar apenas a primeira palavra (maior pontuação)
    return new Set([sortedByPoints[0]?.word]);
  };

  const useHint = () => {
    if (hintsUsed >= 1) return;
    
    const hiddenWords = getHiddenWords();
    
    // Filtrar palavras restantes, excluindo a palavra oculta
    const remainingWords = levelWords.filter(word => 
      !foundWords.some(fw => fw.word === word) && !hiddenWords.has(word)
    );
    
    // Verificar se só resta a palavra oculta
    const allRemainingWords = levelWords.filter(word => 
      !foundWords.some(fw => fw.word === word)
    );
    
    const onlyHiddenWordsLeft = allRemainingWords.every(word => hiddenWords.has(word));
    
    if (onlyHiddenWordsLeft && allRemainingWords.length > 0) {
      toast({
        title: "Dica não disponível",
        description: "A dica não pode ser usada na palavra de Desafio Extra. Tente encontrá-la por conta própria!",
        variant: "destructive"
      });
      return;
    }
    
    if (remainingWords.length > 0) {
      setHintsUsed(prev => prev + 1);
      
      // Encontrar a primeira palavra não encontrada (excluindo oculta) e destacar suas posições
      const hintWord = remainingWords[0];
      const wordPlacement = boardData.placedWords.find(pw => pw.word === hintWord);
      
      if (wordPlacement) {
        setHintHighlightedCells(wordPlacement.positions);
        
        // Remover o destaque após 3 segundos
        setTimeout(() => {
          setHintHighlightedCells([]);
        }, 3000);
      }
      
      logger.info('Dica utilizada', { word: hintWord, hintsUsed: hintsUsed + 1 }, 'GAME_INTERACTIONS');
    } else {
      toast({
        title: "Dica não disponível",
        description: "A dica não pode ser usada na palavra de Desafio Extra. Tente encontrá-la por conta própria!",
        variant: "destructive"
      });
    }
  };

  const handleRevive = () => {
    if (!canRevive) return;
    
    // Simular assistir anúncio (em produção seria integrado com sistema de anúncios)
    setCanRevive(false);
    setShowGameOver(false);
    
    // Adicionar 30 segundos (isso seria feito no componente pai)
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

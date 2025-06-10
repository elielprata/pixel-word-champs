
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
  // Função para calcular pontuação de uma palavra
  const getWordPoints = (word: string) => {
    const basePoints = word.length * 10;
    const bonusPoints = Math.max(0, (word.length - 4) * 5);
    return basePoints + bonusPoints;
  };

  // Identificar as 2 palavras com maior pontuação (palavras ocultas)
  const getHiddenWords = () => {
    const wordsWithPoints = levelWords.map(word => ({
      word,
      points: getWordPoints(word)
    }));
    
    const sortedByPoints = [...wordsWithPoints].sort((a, b) => b.points - a.points);
    return new Set([sortedByPoints[0]?.word, sortedByPoints[1]?.word]);
  };

  const useHint = () => {
    if (hintsUsed >= 1) return;
    
    const hiddenWords = getHiddenWords();
    
    // Filtrar palavras restantes, excluindo as palavras ocultas
    const remainingWords = levelWords.filter(word => 
      !foundWords.some(fw => fw.word === word) && !hiddenWords.has(word)
    );
    
    if (remainingWords.length > 0) {
      setHintsUsed(prev => prev + 1);
      
      // Encontrar a primeira palavra não encontrada (excluindo ocultas) e destacar suas posições
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
    } else {
      console.log('Nenhuma dica disponível - apenas palavras ocultas restantes');
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

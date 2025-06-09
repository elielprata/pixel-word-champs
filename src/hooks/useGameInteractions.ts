
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
    console.log('🔍 Tentando usar dica...');
    console.log('📊 Status atual:', { hintsUsed, foundWords: foundWords.length, levelWords: levelWords.length });
    
    if (hintsUsed >= 1) {
      console.log('❌ Limite de dicas atingido');
      return;
    }
    
    const remainingWords = levelWords.filter(word => !foundWords.some(fw => fw.word === word));
    console.log('📝 Palavras restantes:', remainingWords);
    
    if (remainingWords.length === 0) {
      console.log('🎉 Todas as palavras já foram encontradas!');
      return;
    }
    
    const hintWord = remainingWords[0];
    console.log(`💡 Mostrando dica para: "${hintWord}"`);
    
    setHintsUsed(prev => prev + 1);
    
    // Encontrar a palavra no tabuleiro e destacar suas posições
    const wordPlacement = boardData.placedWords.find(pw => pw.word === hintWord);
    
    if (wordPlacement && wordPlacement.positions) {
      console.log(`✨ Destacando posições da palavra "${hintWord}":`, wordPlacement.positions);
      setHintHighlightedCells(wordPlacement.positions);
      
      // Remover o destaque após 4 segundos
      setTimeout(() => {
        console.log('🔄 Removendo destaque da dica');
        setHintHighlightedCells([]);
      }, 4000);
    } else {
      console.warn(`⚠️ Não foi possível encontrar a colocação da palavra "${hintWord}" no tabuleiro`);
      console.log('🔍 Palavras disponíveis no tabuleiro:', boardData.placedWords.map(pw => pw.word));
    }
  };

  const handleRevive = () => {
    if (!canRevive) return;
    
    console.log('💗 Revive ativado!');
    setCanRevive(false);
    setShowGameOver(false);
    
    // Adicionar 30 segundos (isso seria feito no componente pai)
    console.log('⏰ Revive ativado! +30 segundos');
  };

  const handleGoHome = () => {
    console.log('🏠 Voltando ao menu principal');
    onTimeUp();
  };

  return {
    useHint,
    handleRevive,
    handleGoHome
  };
};

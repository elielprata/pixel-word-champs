
import { useGameInteractions } from '@/hooks/useGameInteractions';
import { type Position } from '@/utils/boardUtils';
import { logger } from '@/utils/logger';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

interface GameBoardActionsProps {
  foundWords: FoundWord[];
  levelWords: string[];
  boardData: { board: string[][]; placedWords: any[] };
  hintsUsed: number;
  level: number;
  isMobile: boolean;
  canRevive: boolean;
  onTimeUp: () => void;
  setHintsUsed: (value: number | ((prev: number) => number)) => void;
  setHintHighlightedCells: (positions: Position[]) => void;
  setShowGameOver: (value: boolean) => void;
  handleCellEnd: () => Position[];
  handleCellMove: (row: number, col: number, isInLineWithSelection: any, fillIntermediateCells: any) => void;
  isValidWordDirection: (positions: Position[]) => boolean;
  isInLineWithSelection: (newPosition: Position, selectedPositions: Position[]) => boolean;
  fillIntermediateCells: (start: Position, end: Position) => Position[];
  addFoundWord: (word: string, positions: Position[]) => void;
}

export const useGameBoardActions = ({
  foundWords,
  levelWords,
  boardData,
  hintsUsed,
  level,
  isMobile,
  canRevive,
  onTimeUp,
  setHintsUsed,
  setHintHighlightedCells,
  setShowGameOver,
  handleCellEnd,
  handleCellMove,
  isValidWordDirection,
  isInLineWithSelection,
  fillIntermediateCells,
  addFoundWord
}: GameBoardActionsProps) => {
  
  const { useHint, handleRevive, handleGoHome } = useGameInteractions(
    foundWords,
    levelWords,
    boardData,
    hintsUsed,
    setHintsUsed,
    setHintHighlightedCells,
    canRevive,
    () => {}, 
    setShowGameOver,
    onTimeUp
  );

  const handleCellEndWithValidation = () => {
    const finalSelection = handleCellEnd();
    
    if (finalSelection.length >= 3) {
      const word = finalSelection.map(pos => boardData.board[pos.row][pos.col]).join('');
      
      logger.info('🔍 Tentativa de palavra', {
        word,
        level,
        isMobile,
        selectionLength: finalSelection.length,
        isInWordList: levelWords.includes(word),
        alreadyFound: foundWords.some(fw => fw.word === word),
        validDirection: isValidWordDirection(finalSelection),
        positions: finalSelection
      }, 'GAME_BOARD_LOGIC');
      
      if (levelWords.includes(word) && 
          !foundWords.some(fw => fw.word === word) && 
          isValidWordDirection(finalSelection)) {
        logger.info('✅ Palavra encontrada com sucesso', { 
          word, 
          level,
          isMobile,
          wordLength: word.length,
          selectionLength: finalSelection.length,
          positions: finalSelection
        }, 'GAME_BOARD_LOGIC');
        addFoundWord(word, finalSelection);
      } else {
        logger.warn('❌ Palavra rejeitada', {
          word,
          reasons: {
            notInWordList: !levelWords.includes(word),
            alreadyFound: foundWords.some(fw => fw.word === word),
            invalidDirection: !isValidWordDirection(finalSelection)
          }
        }, 'GAME_BOARD_LOGIC');
      }
    } else {
      logger.debug('⚠️ Seleção muito curta', { 
        selectionLength: finalSelection.length,
        minimum: 3 
      }, 'GAME_BOARD_LOGIC');
    }
  };

  const handleCellMoveWithValidation = (row: number, col: number) => {
    handleCellMove(row, col, isInLineWithSelection, fillIntermediateCells);
  };

  // Paleta expandida de cores em formato oval como na imagem
  const getWordColor = (wordIndex: number) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',      
      'bg-gradient-to-br from-purple-500 to-violet-600',  
      'bg-gradient-to-br from-emerald-500 to-green-600',  
      'bg-gradient-to-br from-orange-500 to-amber-600',   
      'bg-gradient-to-br from-pink-500 to-rose-600',      
      'bg-gradient-to-br from-cyan-500 to-teal-600',      
      'bg-gradient-to-br from-red-500 to-pink-600',       
      'bg-gradient-to-br from-indigo-500 to-purple-600',  
      'bg-gradient-to-br from-yellow-500 to-orange-500',  
      'bg-gradient-to-br from-lime-500 to-green-500',     
      'bg-gradient-to-br from-fuchsia-500 to-pink-600',   
      'bg-gradient-to-br from-slate-500 to-gray-600'      
    ];
    return colors[wordIndex % colors.length];
  };

  // Função para verificar se uma célula pertence a uma palavra específica
  const getCellWordIndex = (row: number, col: number) => {
    return foundWords.findIndex(fw => 
      fw.positions.some(pos => pos.row === row && pos.col === col)
    );
  };

  return {
    handleCellEndWithValidation,
    handleCellMoveWithValidation,
    useHint,
    handleRevive,
    handleGoHome,
    getWordColor,
    getCellWordIndex
  };
};

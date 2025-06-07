
import React from 'react';
import GameProgressBar from './game/GameProgressBar';
import GameStats from './game/GameStats';
import WordsList from './game/WordsList';
import GameBoardGrid from './game/GameBoardGrid';
import GameModals from './game/GameModals';
import { useBoard } from '@/hooks/useBoard';
import { useBoardInteraction } from '@/hooks/useBoardInteraction';
import { useWordValidation } from '@/hooks/useWordValidation';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useGameInteractions } from '@/hooks/useGameInteractions';
import { type Position } from '@/utils/boardUtils';

interface GameBoardProps {
  level: number;
  timeLeft: number;
  onWordFound: (word: string, points: number) => void;
  onTimeUp: () => void;
  onLevelComplete: (levelScore: number) => void;
  onAdvanceLevel: () => void;
  onStopGame: () => void;
}

const GameBoard = ({ level, timeLeft, onWordFound, onTimeUp, onLevelComplete, onAdvanceLevel, onStopGame }: GameBoardProps) => {
  const { boardData, size, levelWords } = useBoard(level);
  const { 
    selectedCells, 
    isSelecting, 
    handleCellStart, 
    handleCellMove, 
    handleCellEnd, 
    isCellSelected 
  } = useBoardInteraction();
  const { isValidWordDirection } = useWordValidation();

  const {
    foundWords,
    hintsUsed,
    showGameOver,
    showLevelComplete,
    canRevive,
    setHintsUsed,
    setCanRevive,
    setShowGameOver,
    setHintHighlightedCells,
    addFoundWord,
    isCellPermanentlyMarked,
    isCellHintHighlighted
  } = useGameLogic(level, timeLeft, levelWords, onWordFound, onLevelComplete);

  const { useHint, handleRevive, handleGoHome } = useGameInteractions(
    foundWords,
    levelWords,
    boardData,
    hintsUsed,
    setHintsUsed,
    setHintHighlightedCells,
    canRevive,
    setCanRevive,
    setShowGameOver,
    onTimeUp
  );

  const handleCellEndWithValidation = () => {
    const finalSelection = handleCellEnd();
    
    if (finalSelection.length >= 3) {
      const word = finalSelection.map(pos => boardData.board[pos.row][pos.col]).join('');
      
      // Verificar se é uma palavra válida e se a direção é permitida
      if (levelWords.includes(word) && 
          !foundWords.some(fw => fw.word === word) && 
          isValidWordDirection(finalSelection)) {
        addFoundWord(word, finalSelection);
      }
    }
  };

  const handleCellMoveWithValidation = (row: number, col: number) => {
    handleCellMove(row, col, isValidWordDirection);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      <div className="w-full max-w-md mb-6">
        <GameProgressBar 
          level={level}
          foundWords={foundWords.length}
          totalWords={5}
        />
        
        <GameStats 
          timeLeft={timeLeft}
          hintsUsed={hintsUsed}
          totalScore={foundWords.reduce((sum, fw) => sum + fw.points, 0)}
          onUseHint={useHint}
        />
      </div>

      <GameBoardGrid
        boardData={boardData}
        size={size}
        selectedCells={selectedCells}
        isSelecting={isSelecting}
        isCellSelected={isCellSelected}
        isCellPermanentlyMarked={isCellPermanentlyMarked}
        isCellHintHighlighted={isCellHintHighlighted}
        handleCellStart={handleCellStart}
        handleCellMove={handleCellMoveWithValidation}
        handleCellEndWithValidation={handleCellEndWithValidation}
      />

      <WordsList 
        levelWords={levelWords}
        foundWords={foundWords}
      />

      <GameModals
        showGameOver={showGameOver}
        showLevelComplete={showLevelComplete}
        foundWords={foundWords}
        level={level}
        canRevive={canRevive}
        onRevive={handleRevive}
        onGoHome={handleGoHome}
        onAdvanceLevel={onAdvanceLevel}
        onStopGame={onStopGame}
      />
    </div>
  );
};

export default GameBoard;

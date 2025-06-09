
import React from 'react';
import GameOverModal from './GameOverModal';
import LevelCompleteModal from './LevelCompleteModal';

interface FoundWord {
  word: string;
  positions: Array<{row: number, col: number}>;
  points: number;
}

interface GameModalsProps {
  showGameOver: boolean;
  showLevelComplete: boolean;
  foundWords: FoundWord[];
  level: number;
  canRevive: boolean;
  onRevive: () => void;
  onGoHome: () => void;
  onAdvanceLevel: () => void;
  onStopGame: () => void;
}

const GameModals = ({
  showGameOver,
  showLevelComplete,
  foundWords,
  level,
  canRevive,
  onRevive,
  onGoHome,
  onAdvanceLevel,
  onStopGame
}: GameModalsProps) => {
  const totalScore = foundWords.reduce((sum, fw) => sum + fw.points, 0);

  const handleAdvanceLevelClick = () => {
    console.log(`Advancing to next level from level ${level}`);
    onAdvanceLevel();
  };

  const handleStayLevel = () => {
    console.log(`User chose to stop at level ${level} - calling onStopGame to mark participation`);
    onStopGame();
  };

  const handleGameOverStop = () => {
    console.log(`User chose to stop from Game Over modal at level ${level} - calling onStopGame to mark participation`);
    onStopGame();
  };

  return (
    <>
      <GameOverModal
        isOpen={showGameOver}
        score={totalScore}
        wordsFound={foundWords.length}
        totalWords={5}
        onRevive={onRevive}
        onGoHome={handleGameOverStop}
        canRevive={canRevive}
      />

      <LevelCompleteModal
        isOpen={showLevelComplete}
        level={level}
        score={totalScore}
        onAdvance={handleAdvanceLevelClick}
        onStay={handleStayLevel}
      />
    </>
  );
};

export default GameModals;

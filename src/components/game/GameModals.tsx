
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
    onAdvanceLevel();
  };

  const handleStayLevel = () => {
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
        onGoHome={onGoHome}
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

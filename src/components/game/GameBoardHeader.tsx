
import React from 'react';
import GameProgressBar from './GameProgressBar';
import GameStats from './GameStats';

interface FoundWord {
  word: string;
  positions: Array<{row: number, col: number}>;
  points: number;
}

interface GameBoardHeaderProps {
  level: number;
  timeLeft: number;
  foundWords: FoundWord[];
  levelWords: string[];
  hintsUsed: number;
  currentLevelScore: number;
  onUseHint: () => void;
}

const GameBoardHeader = ({
  level,
  timeLeft,
  foundWords,
  levelWords,
  hintsUsed,
  currentLevelScore,
  onUseHint
}: GameBoardHeaderProps) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
      <GameProgressBar 
        level={level}
        foundWords={foundWords.length}
        totalWords={levelWords.length}
      />
      
      <GameStats 
        timeLeft={timeLeft}
        hintsUsed={hintsUsed}
        levelScore={currentLevelScore}
        onUseHint={onUseHint}
      />
    </div>
  );
};

export default GameBoardHeader;

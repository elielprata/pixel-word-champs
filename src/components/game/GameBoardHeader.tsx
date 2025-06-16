
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
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border-2 border-white/30 relative overflow-hidden animate-fade-in">
      {/* Gradiente de fundo sutil */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl" />
      
      {/* Brilho sutil no topo */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-t-2xl" />
      
      <div className="relative z-10">
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
    </div>
  );
};

export default GameBoardHeader;

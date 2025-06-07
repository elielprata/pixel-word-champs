
import React from 'react';
import GameBoard from '../GameBoard';
import GameHeader from './GameHeader';

interface ChallengeGameScreenProps {
  currentLevel: number;
  timeRemaining: number;
  score: number;
  onBack: () => void;
  onWordFound: (word: string, points: number) => void;
  onTimeUp: () => void;
  onLevelComplete: (levelScore: number) => Promise<void>;
  onAdvanceLevel: () => void;
  onStopGame: () => void;
}

const ChallengeGameScreen = ({
  currentLevel,
  timeRemaining,
  score,
  onBack,
  onWordFound,
  onTimeUp,
  onLevelComplete,
  onAdvanceLevel,
  onStopGame
}: ChallengeGameScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <GameHeader 
        onBack={onBack}
        currentLevel={currentLevel}
        timeRemaining={timeRemaining}
        score={score}
      />

      <div className="p-4">
        <GameBoard 
          level={currentLevel} 
          timeLeft={timeRemaining}
          onWordFound={onWordFound}
          onTimeUp={onTimeUp}
          onLevelComplete={onLevelComplete}
          onAdvanceLevel={onAdvanceLevel}
          onStopGame={onStopGame}
        />
      </div>
    </div>
  );
};

export default ChallengeGameScreen;

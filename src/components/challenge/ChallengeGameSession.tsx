
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import GameBoard from '../GameBoard';
import { logger } from '@/utils/logger';

interface ChallengeGameSessionProps {
  currentLevel: number;
  timeRemaining: number;
  onWordFound: (word: string, points: number) => void;
  onTimeUp: () => void;
  onLevelComplete: (levelScore: number) => void;
  onAdvanceLevel: () => void;
  onStopGame: () => void;
  onRevive: () => void;
}

const ChallengeGameSession = ({
  currentLevel,
  timeRemaining,
  onWordFound,
  onTimeUp,
  onLevelComplete,
  onAdvanceLevel,
  onStopGame,
  onRevive
}: ChallengeGameSessionProps) => {
  logger.debug('Renderizando ChallengeGameSession', { 
    currentLevel, 
    timeRemaining 
  }, 'CHALLENGE_GAME_SESSION');

  const handleStopChallenge = () => {
    logger.info('Parando desafio', { currentLevel }, 'CHALLENGE_GAME_SESSION');
    onStopGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="absolute top-0 left-0 z-10 p-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleStopChallenge}
          className="rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
      </div>

      <GameBoard
        level={currentLevel}
        timeLeft={timeRemaining}
        onWordFound={onWordFound}
        onTimeUp={onTimeUp}
        onLevelComplete={onLevelComplete}
        onAdvanceLevel={onAdvanceLevel}
        onStopGame={onStopGame}
        canRevive={true}
        onRevive={onRevive}
      />
    </div>
  );
};

export default ChallengeGameSession;


import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import GameBoard from '../GameBoard';
import { logger } from '@/utils/logger';

interface ChallengeGameSessionProps {
  currentLevel: number;
  timeRemaining: number;
  onTimeUp: () => void;
  onLevelComplete: (levelScore: number) => void;
  onAdvanceLevel: () => void;
  onStopGame: () => void;
  onRevive: () => void;
}

const ChallengeGameSession = ({
  currentLevel,
  timeRemaining,
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

  const handleStopGame = () => {
    logger.info('Parando jogo de desafio', { currentLevel }, 'CHALLENGE_GAME_SESSION');
    onStopGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative">
      <div className="absolute top-4 left-4 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleStopGame}
          className="rounded-full bg-white/90 backdrop-blur-sm shadow-xl hover:bg-white hover:shadow-2xl border-2 border-white/50 transition-all duration-300 transform hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Button>
      </div>

      <div className="pt-4">
        <GameBoard
          challengeId={`level-${currentLevel}`}
          onBack={onStopGame}
          onComplete={onAdvanceLevel}
        />
      </div>
    </div>
  );
};

export default ChallengeGameSession;

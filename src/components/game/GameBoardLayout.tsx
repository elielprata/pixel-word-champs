
import React from 'react';
import { logger } from '@/utils/logger';

interface GameBoardLayoutProps {
  children: React.ReactNode;
}

const GameBoardLayout = ({ children }: GameBoardLayoutProps) => {
  logger.debug('Renderizando GameBoardLayout', undefined, 'GAME_BOARD_LAYOUT');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {children}
      </div>
    </div>
  );
};

export default GameBoardLayout;

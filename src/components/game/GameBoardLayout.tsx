
import React from 'react';
import { GAME_CONSTANTS } from '@/constants/game';

interface GameBoardLayoutProps {
  children: React.ReactNode;
}

const GameBoardLayout = ({ children }: GameBoardLayoutProps) => {
  // Selecionar tema de fundo aleatório (ou baseado no nível)
  const backgroundTheme = GAME_CONSTANTS.BACKGROUND_THEMES[0]; // Pode ser dinâmico baseado no nível

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br ${backgroundTheme} p-2 relative game-board-area`}
      style={{
        // Game board specific - block all scroll and touch
        overflow: 'hidden',
        overscrollBehavior: 'none',
        touchAction: 'none',
        position: 'relative',
        width: '100%',
        minHeight: '100vh'
      }}
    >
      {/* Efeitos de fundo gamificados */}
      <div className="absolute inset-0 bg-black/10 touch-none" />
      
      {/* Partículas flutuantes de fundo */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-white/20 rounded-full animate-bounce touch-none" style={{ animationDelay: '0s', animationDuration: '3s' }} />
      <div className="absolute top-32 right-16 w-1.5 h-1.5 bg-white/15 rounded-full animate-bounce touch-none" style={{ animationDelay: '1s', animationDuration: '4s' }} />
      <div className="absolute bottom-24 left-20 w-3 h-3 bg-white/10 rounded-full animate-bounce touch-none" style={{ animationDelay: '2s', animationDuration: '5s' }} />
      <div className="absolute bottom-40 right-8 w-2 h-2 bg-white/20 rounded-full animate-bounce touch-none" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }} />
      
      {/* Círculos decorativos */}
      <div className="absolute top-20 right-4 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse touch-none" />
      <div className="absolute bottom-20 left-4 w-40 h-40 bg-white/5 rounded-full blur-xl animate-pulse touch-none" style={{ animationDelay: '1s' }} />
      
      {/* Conteúdo principal - GAME AREA with no scroll */}
      <div 
        className="relative z-10 max-w-sm mx-auto space-y-3 game-board-area"
        style={{
          overflow: 'hidden',
          overscrollBehavior: 'none',
          touchAction: 'none',
          height: '100%',
          maxHeight: '100vh'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default GameBoardLayout;

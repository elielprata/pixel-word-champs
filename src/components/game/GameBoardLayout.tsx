
import React, { useEffect } from 'react';
import { GAME_CONSTANTS } from '@/constants/game';

interface GameBoardLayoutProps {
  children: React.ReactNode;
}

const GameBoardLayout = ({ children }: GameBoardLayoutProps) => {
  // Selecionar tema de fundo aleatório (ou baseado no nível)
  const backgroundTheme = GAME_CONSTANTS.BACKGROUND_THEMES[0]; // Pode ser dinâmico baseado no nível

  // Garantir proteção anti-scroll ao montar o componente
  useEffect(() => {
    const gameArea = document.querySelector('.game-board-area');
    if (gameArea) {
      // Aplicar proteções específicas
      (gameArea as HTMLElement).style.touchAction = 'none';
      (gameArea as HTMLElement).style.overscrollBehavior = 'contain';
      (gameArea as HTMLElement).style.overflow = 'hidden';
      (gameArea as HTMLElement).style.transform = 'none';
      (gameArea as HTMLElement).style.willChange = 'auto';
      
      console.log('🛡️ Proteção aplicada ao GameBoardLayout');
    }
    
    // Prevenir scroll durante o jogo
    const preventScroll = (e: TouchEvent) => {
      const target = e.target as Element;
      if (target.closest('.game-board-area')) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', preventScroll, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundTheme} p-2 relative overflow-hidden game-board-area no-zoom transform-none-final`}
         style={{
           touchAction: 'none',
           overscrollBehavior: 'contain',
           overflow: 'hidden',
           maxWidth: '100vw',
           boxSizing: 'border-box',
           transform: 'none',
           willChange: 'auto'
         }}>
      {/* Efeitos de fundo gamificados */}
      <div className="absolute inset-0 bg-black/10" />
      
      {/* Partículas flutuantes de fundo - SEM TRANSFORMS que causam zoom */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-white/20 rounded-full animate-bounce transform-none-final" style={{ animationDelay: '0s', animationDuration: '3s' }} />
      <div className="absolute top-32 right-16 w-1.5 h-1.5 bg-white/15 rounded-full animate-bounce transform-none-final" style={{ animationDelay: '1s', animationDuration: '4s' }} />
      <div className="absolute bottom-24 left-20 w-3 h-3 bg-white/10 rounded-full animate-bounce transform-none-final" style={{ animationDelay: '2s', animationDuration: '5s' }} />
      <div className="absolute bottom-40 right-8 w-2 h-2 bg-white/20 rounded-full animate-bounce transform-none-final" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }} />
      
      {/* Círculos decorativos */}
      <div className="absolute top-20 right-4 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse transform-none-final" />
      <div className="absolute bottom-20 left-4 w-40 h-40 bg-white/5 rounded-full blur-xl animate-pulse transform-none-final" style={{ animationDelay: '1s' }} />
      
      {/* Conteúdo principal com proteção máxima */}
      <div className="relative z-10 max-w-sm mx-auto space-y-3 no-zoom transform-none-final"
           style={{
             maxWidth: 'min(384px, calc(100vw - 16px))',
             touchAction: 'none',
             overflow: 'visible',
             transform: 'none',
             willChange: 'auto'
           }}>
        {children}
      </div>
    </div>
  );
};

export default GameBoardLayout;

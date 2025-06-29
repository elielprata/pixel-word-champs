
import React from 'react';

export const CompetitionCardDecorations = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-2 right-6 w-1 h-1 bg-blue-400/60 rounded-full animate-pulse" style={{ animationDelay: '0s', animationDuration: '2s' }}></div>
      <div className="absolute top-5 right-10 w-1.5 h-1.5 bg-purple-400/50 rounded-full animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '3s' }}></div>
      <div className="absolute bottom-6 left-4 w-1 h-1 bg-green-400/50 rounded-full animate-pulse" style={{ animationDelay: '1s', animationDuration: '2.5s' }}></div>
      
      <div className="absolute top-2 left-12 text-xs text-blue-400/50 animate-pulse font-bold" style={{ animationDelay: '0.3s', animationDuration: '4s' }}>⚡</div>
      <div className="absolute bottom-4 right-12 text-xs text-purple-400/40 animate-pulse font-bold" style={{ animationDelay: '2s', animationDuration: '3s' }}>🎮</div>
      <div className="absolute top-6 right-16 text-xs text-green-400/35 animate-pulse font-bold" style={{ animationDelay: '1.2s', animationDuration: '3.5s' }}>🏆</div>
    </div>
  );
};


import React from 'react';
import { Trophy } from 'lucide-react';
import { APP_CONFIG } from '@/constants/app';

const HomeHeader = () => {
  return (
    <div className="text-center py-6 px-4">
      {/* Game Icon with Letter Grid Effect */}
      <div className="relative inline-flex items-center justify-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-xl shadow-lg flex items-center justify-center relative overflow-hidden">
          {/* Mini grid pattern inside icon */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.3) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px)
              `,
              backgroundSize: '4px 4px'
            }}
          ></div>
          <Trophy className="w-8 h-8 text-white relative z-10" />
        </div>
        {/* Sparkle effects */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-amber-300 rounded-full animate-pulse"></div>
      </div>

      {/* Game Title with Letter Spacing */}
      <h1 className="text-2xl font-bold text-slate-800 mb-2 tracking-wide">
        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          {APP_CONFIG.NAME}
        </span>
      </h1>
      
      {/* Subtitle with Game Theme */}
      <div className="flex items-center justify-center gap-2 text-slate-600">
        <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
        <p className="text-sm font-medium">Encontre as palavras escondidas</p>
        <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
      </div>
      
      {/* Letter Decoration */}
      <div className="flex items-center justify-center gap-1 mt-3 opacity-60">
        {['W', 'O', 'R', 'D', 'S'].map((letter, index) => (
          <div 
            key={letter}
            className="w-6 h-6 bg-slate-200 rounded text-xs font-bold text-slate-600 flex items-center justify-center animate-pulse"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            {letter}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeHeader;

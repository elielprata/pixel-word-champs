
import React from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import { APP_CONFIG } from '@/constants/app';

const HomeHeader = () => {
  return (
    <div className="text-center space-y-4">
      <div className="relative">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-700 rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
          <Trophy className="w-10 h-10 text-white" />
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-gray-900 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          {APP_CONFIG.NAME}
        </h1>
        <p className="text-gray-600 font-medium">
          Desafie seus limites e conquiste a vitória!
        </p>
      </div>

      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-gray-600 font-medium">Sistema Online</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-gray-600 font-medium">Competições Ativas</span>
        </div>
      </div>
    </div>
  );
};

export default HomeHeader;

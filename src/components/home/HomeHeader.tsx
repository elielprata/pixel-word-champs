
import React from 'react';
import { Trophy } from 'lucide-react';
import { APP_CONFIG } from '@/constants/app';

const HomeHeader = () => {
  return (
    <div className="text-center mb-6">
      <div className="relative">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-3 shadow-lg">
          <Trophy className="w-7 h-7 text-white" />
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
      </div>
      
      <h1 className="text-2xl font-bold text-slate-800 mb-1 tracking-tight">
        {APP_CONFIG.NAME}
      </h1>
      <p className="text-slate-600 text-sm font-medium">
        🎯 Desafie-se nas competições diárias
      </p>
    </div>
  );
};

export default HomeHeader;


import React from 'react';
import { Target } from 'lucide-react';

interface GameProgressBarProps {
  level: number;
  foundWords: number;
  totalWords: number;
}

const GameProgressBar = ({ level, foundWords, totalWords }: GameProgressBarProps) => {
  const progress = (foundWords / totalWords) * 100;

  return (
    <div className="bg-white rounded-full p-1 shadow-md mb-4">
      <div className="flex justify-between items-center px-3 py-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-bold text-gray-800">Nível {level}</span>
        </div>
        <div className="text-sm font-medium text-gray-600">
          {foundWords}/{totalWords} palavras
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default GameProgressBar;

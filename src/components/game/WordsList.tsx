import React from 'react';
import { CheckCircle, Star } from 'lucide-react';

interface FoundWord {
  word: string;
  positions: Array<{row: number, col: number}>;
  points: number;
}

interface WordsListProps {
  levelWords: string[];
  foundWords: FoundWord[];
  getWordColor: (wordIndex: number) => string;
}

const WordsList = ({ levelWords, foundWords, getWordColor }: WordsListProps) => {
  return (
    <div className="p-2">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-bold text-slate-800">Palavras do Nível</h3>
        <div className="text-sm text-slate-500">({foundWords.length}/5)</div>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {levelWords.map((word, index) => {
          const foundWordIndex = foundWords.findIndex(fw => fw.word === word);
          const isFound = foundWordIndex !== -1;
          const foundWord = foundWords[foundWordIndex];
          
          return (
            <div 
              key={index}
              className={`
                relative p-3 rounded-xl transition-all duration-300 border-2
                ${isFound 
                  ? `bg-gradient-to-r ${getWordColor(foundWordIndex)} text-white border-white/30 shadow-lg transform scale-105` 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-200'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isFound && (
                    <CheckCircle className="w-5 h-5 text-white/90" />
                  )}
                  <div className="font-semibold text-base">{word}</div>
                </div>
                
                {isFound && foundWord && (
                  <div className="text-right">
                    <div className="text-sm font-bold text-white/90">
                      +{foundWord.points} pts
                    </div>
                    <div className="text-xs text-white/70">
                      Encontrada!
                    </div>
                  </div>
                )}
                
                {!isFound && (
                  <div className="text-sm text-slate-400">
                    Procurar...
                  </div>
                )}
              </div>
              
              {isFound && (
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {foundWords.length === 5 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl text-center">
          <div className="flex items-center justify-center gap-2">
            <Star className="w-5 h-5" />
            <span className="font-bold">Nível Completo!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordsList;


import React from 'react';
import { CheckCircle, Star, Target, Lock, Sparkles } from 'lucide-react';
import { useGamePointsConfig } from '@/hooks/useGamePointsConfig';

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
  const { getPointsForWord } = useGamePointsConfig();

  const TOTAL_WORDS = 5;

  // Identificar apenas a palavra com maior pontuação
  const wordsWithPoints = levelWords.map(word => ({
    word,
    points: getPointsForWord(word)
  }));
  
  const sortedByPoints = [...wordsWithPoints].sort((a, b) => b.points - a.points);
  const hiddenWords = new Set([sortedByPoints[0]?.word]);

  return (
    <div className="p-3 space-y-3">
      {/* Header gamificado */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Target className="w-4 h-4 text-purple-600" />
            <Sparkles className="w-2 h-2 text-yellow-500 absolute -top-0.5 -right-0.5 animate-pulse" />
          </div>
          <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Palavras
          </span>
        </div>
        <div className="flex items-center gap-1 bg-gradient-to-r from-purple-100 to-blue-100 px-3 py-1 rounded-full border border-purple-200">
          <span className="text-sm font-bold text-purple-700">{foundWords.length}</span>
          <span className="text-sm text-purple-500 mx-0.5">/</span>
          <span className="text-sm text-purple-600">{TOTAL_WORDS}</span>
        </div>
      </div>
      
      {/* Grid de palavras gamificado */}
      <div className="grid grid-cols-1 gap-2">
        {levelWords.map((word, index) => {
          const foundWordIndex = foundWords.findIndex(fw => fw.word === word);
          const isFound = foundWordIndex !== -1;
          const foundWord = foundWords[foundWordIndex];
          const isHidden = hiddenWords.has(word);
          
          return (
            <div 
              key={index}
              className={`
                relative flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 transform hover:scale-[1.02] border-2
                ${isFound 
                  ? `bg-gradient-to-r ${getWordColor(foundWordIndex)} text-white shadow-lg border-white/30 animate-bounce-in` 
                  : isHidden
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md border-purple-300'
                    : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 text-gray-700 hover:from-gray-100 hover:to-gray-200 hover:border-gray-300 shadow-sm'
                }
              `}
            >
              {/* Palavra e ícone */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isFound && (
                  <div className="relative">
                    <CheckCircle className="w-4 h-4 text-white flex-shrink-0" />
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                  </div>
                )}
                {isHidden && !isFound && (
                  <Lock className="w-4 h-4 text-white/90 flex-shrink-0" />
                )}
                <span className={`text-sm font-bold truncate ${
                  isFound || isHidden ? 'text-white' : 'text-gray-700'
                }`}>
                  {isHidden && !isFound 
                    ? `${word.length} letras` 
                    : word
                  }
                </span>
              </div>
              
              {/* Pontos ou indicador */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {isFound && foundWord && (
                  <span className="text-xs font-bold text-white bg-black/20 px-2 py-1 rounded-full border border-white/20">
                    +{foundWord.points}
                  </span>
                )}
                {isHidden && !isFound && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-300" />
                    <span className="text-xs font-bold text-white bg-black/20 px-2 py-1 rounded-full border border-white/20">
                      Extra
                    </span>
                  </div>
                )}
              </div>

              {/* Efeito de brilho para palavras encontradas */}
              {isFound && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Status de conclusão gamificado */}
      {foundWords.length === TOTAL_WORDS && (
        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white rounded-xl shadow-lg border-2 border-green-300 animate-bounce-in">
          <Star className="w-4 h-4 animate-spin" />
          <span className="text-sm font-bold">Nível Completo!</span>
          <Star className="w-4 h-4 animate-spin" style={{ animationDelay: '0.5s' }} />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
        </div>
      )}
    </div>
  );
};

export default WordsList;

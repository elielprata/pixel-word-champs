
import React from 'react';
import { CheckCircle, Star, Target, Lock } from 'lucide-react';

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
  // Calcular pontuação de cada palavra para identificar as 2 maiores
  const getWordPoints = (word: string) => {
    // Pontuação baseada no tamanho da palavra (mesmo cálculo do useGamePointsConfig)
    const basePoints = word.length * 10;
    const bonusPoints = Math.max(0, (word.length - 4) * 5);
    return basePoints + bonusPoints;
  };

  // Identificar as 2 palavras com maior pontuação
  const wordsWithPoints = levelWords.map(word => ({
    word,
    points: getWordPoints(word)
  }));
  
  const sortedByPoints = [...wordsWithPoints].sort((a, b) => b.points - a.points);
  const hiddenWords = new Set([sortedByPoints[0]?.word, sortedByPoints[1]?.word]);

  return (
    <div className="p-2">
      {/* Header ultra compacto */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <Target className="w-3 h-3 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-700">Palavras</span>
        </div>
        <div className="flex items-center gap-0.5">
          <span className="text-xs font-bold text-indigo-600">{foundWords.length}</span>
          <span className="text-xs text-slate-400">/</span>
          <span className="text-xs text-slate-500">{levelWords.length}</span>
        </div>
      </div>
      
      {/* Grid de palavras em 2 colunas - mais compacto */}
      <div className="grid grid-cols-2 gap-1">
        {levelWords.map((word, index) => {
          const foundWordIndex = foundWords.findIndex(fw => fw.word === word);
          const isFound = foundWordIndex !== -1;
          const foundWord = foundWords[foundWordIndex];
          const isHidden = hiddenWords.has(word);
          
          return (
            <div 
              key={index}
              className={`
                relative px-2 py-1.5 rounded-md transition-all duration-200 text-center
                ${isFound 
                  ? `bg-gradient-to-r ${getWordColor(foundWordIndex)} text-white shadow-sm` 
                  : isHidden
                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white border border-purple-300'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }
              `}
            >
              {/* Palavra ou placeholder para palavras ocultas */}
              <div className="flex items-center justify-center gap-1">
                {isFound && (
                  <CheckCircle className="w-2.5 h-2.5 text-white/90" />
                )}
                {isHidden && !isFound && (
                  <Lock className="w-2.5 h-2.5 text-white/90" />
                )}
                <span className="text-xs font-medium">
                  {isHidden && !isFound 
                    ? `${word.length} letras` 
                    : word
                  }
                </span>
              </div>
              
              {/* Pontos (só se encontrada) - mais compacto */}
              {isFound && foundWord && (
                <div className="text-[10px] text-white/80 mt-0.5">
                  +{foundWord.points}pts
                </div>
              )}
              
              {/* Indicador especial para palavras ocultas não encontradas */}
              {isHidden && !isFound && (
                <div className="text-[10px] text-white/80 mt-0.5">
                  Extra
                </div>
              )}
              
              {/* Indicador visual se encontrada - menor */}
              {isFound && (
                <div className="absolute top-0.5 right-0.5">
                  <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Status de conclusão - mais compacto */}
      {foundWords.length === levelWords.length && (
        <div className="mt-2 px-2 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-md text-center">
          <div className="flex items-center justify-center gap-1">
            <Star className="w-3 h-3" />
            <span className="text-xs font-semibold">Completo!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordsList;

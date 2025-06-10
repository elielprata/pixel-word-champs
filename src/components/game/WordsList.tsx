
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
    <div className="p-3">
      {/* Header compacto */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-semibold text-slate-700">Palavras</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-indigo-600">{foundWords.length}</span>
          <span className="text-xs text-slate-400">/</span>
          <span className="text-xs text-slate-500">{levelWords.length}</span>
        </div>
      </div>
      
      {/* Grid de palavras em 2 colunas */}
      <div className="grid grid-cols-2 gap-2">
        {levelWords.map((word, index) => {
          const foundWordIndex = foundWords.findIndex(fw => fw.word === word);
          const isFound = foundWordIndex !== -1;
          const foundWord = foundWords[foundWordIndex];
          const isHidden = hiddenWords.has(word);
          
          return (
            <div 
              key={index}
              className={`
                relative px-3 py-2 rounded-lg transition-all duration-200 text-center
                ${isFound 
                  ? `bg-gradient-to-r ${getWordColor(foundWordIndex)} text-white shadow-md` 
                  : isHidden
                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white border border-purple-300'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }
              `}
            >
              {/* Palavra ou placeholder para palavras ocultas */}
              <div className="flex items-center justify-center gap-1">
                {isFound && (
                  <CheckCircle className="w-3 h-3 text-white/90" />
                )}
                {isHidden && !isFound && (
                  <Lock className="w-3 h-3 text-white/90" />
                )}
                <span className="text-sm font-medium">
                  {isHidden && !isFound 
                    ? `${word.length} letras` 
                    : word
                  }
                </span>
              </div>
              
              {/* Pontos (só se encontrada) */}
              {isFound && foundWord && (
                <div className="text-xs text-white/80 mt-1">
                  +{foundWord.points}pts
                </div>
              )}
              
              {/* Indicador especial para palavras ocultas não encontradas */}
              {isHidden && !isFound && (
                <div className="text-xs text-white/80 mt-1">
                  Desafio Extra
                </div>
              )}
              
              {/* Indicador visual se encontrada */}
              {isFound && (
                <div className="absolute top-1 right-1">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Status de conclusão */}
      {foundWords.length === levelWords.length && (
        <div className="mt-3 px-3 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg text-center">
          <div className="flex items-center justify-center gap-1">
            <Star className="w-4 h-4" />
            <span className="text-sm font-semibold">Completo!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordsList;

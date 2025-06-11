
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

  // Dividir palavras em quadrantes verticais
  const wordsPerQuadrant = Math.ceil(levelWords.length / 4);
  const quadrants = [
    levelWords.slice(0, wordsPerQuadrant),
    levelWords.slice(wordsPerQuadrant, wordsPerQuadrant * 2),
    levelWords.slice(wordsPerQuadrant * 2, wordsPerQuadrant * 3),
    levelWords.slice(wordsPerQuadrant * 3)
  ].filter(quadrant => quadrant.length > 0);

  return (
    <div className="p-3">
      {/* Header compacto */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Target className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-semibold text-slate-700">Palavras</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-indigo-600">{foundWords.length}</span>
          <span className="text-xs text-slate-400">/</span>
          <span className="text-sm text-slate-500">{levelWords.length}</span>
        </div>
      </div>
      
      {/* Grid de quadrantes verticais */}
      <div className="grid grid-cols-4 gap-2">
        {quadrants.map((quadrant, quadrantIndex) => (
          <div key={quadrantIndex} className="flex flex-col space-y-1.5">
            {/* Indicador do quadrante */}
            <div className="text-center">
              <div className="w-6 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full mx-auto mb-1"></div>
              <span className="text-[10px] font-medium text-slate-500">Q{quadrantIndex + 1}</span>
            </div>
            
            {/* Palavras do quadrante */}
            {quadrant.map((word) => {
              const wordIndex = levelWords.indexOf(word);
              const foundWordIndex = foundWords.findIndex(fw => fw.word === word);
              const isFound = foundWordIndex !== -1;
              const foundWord = foundWords[foundWordIndex];
              const isHidden = hiddenWords.has(word);
              
              return (
                <div 
                  key={wordIndex}
                  className={`
                    relative px-2 py-2 rounded-lg transition-all duration-200 text-center
                    ${isFound 
                      ? `bg-gradient-to-br ${getWordColor(foundWordIndex)} text-white shadow-sm border border-white/20` 
                      : isHidden
                        ? 'bg-gradient-to-br from-purple-500 to-violet-600 text-white border border-purple-300/50'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }
                  `}
                >
                  {/* Palavra ou placeholder para palavras ocultas */}
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    {isFound && (
                      <CheckCircle className="w-3 h-3 text-white/90" />
                    )}
                    {isHidden && !isFound && (
                      <Lock className="w-3 h-3 text-white/90" />
                    )}
                    <span className="text-xs font-medium leading-tight">
                      {isHidden && !isFound 
                        ? `${word.length}L` 
                        : word
                      }
                    </span>
                  </div>
                  
                  {/* Pontos (só se encontrada) */}
                  {isFound && foundWord && (
                    <div className="text-[9px] text-white/80 mt-0.5 font-medium">
                      +{foundWord.points}
                    </div>
                  )}
                  
                  {/* Indicador especial para palavras ocultas não encontradas */}
                  {isHidden && !isFound && (
                    <div className="text-[9px] text-white/80 mt-0.5 font-medium">
                      Bônus
                    </div>
                  )}
                  
                  {/* Indicador visual se encontrada */}
                  {isFound && (
                    <div className="absolute -top-0.5 -right-0.5">
                      <div className="w-2 h-2 bg-white/80 rounded-full border border-white/60"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      {/* Status de conclusão */}
      {foundWords.length === levelWords.length && (
        <div className="mt-3 px-3 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl text-center">
          <div className="flex items-center justify-center gap-1.5">
            <Star className="w-4 h-4" />
            <span className="text-sm font-semibold">Nível Completo!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordsList;

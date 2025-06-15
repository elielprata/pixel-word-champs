
import React from 'react';
import { CheckCircle, Star, Target, Lock } from 'lucide-react';
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

  // Identificar apenas a palavra com maior pontuação
  const wordsWithPoints = levelWords.map(word => ({
    word,
    points: getPointsForWord(word)
  }));
  
  const sortedByPoints = [...wordsWithPoints].sort((a, b) => b.points - a.points);
  // Apenas a primeira palavra (maior pontuação) é oculta
  const hiddenWords = new Set([sortedByPoints[0]?.word]);

  // Contar apenas palavras encontradas que NÃO são ocultas
  const visibleFoundWords = foundWords.filter(fw => !hiddenWords.has(fw.word));
  const actualFoundCount = visibleFoundWords.length;

  return (
    <div className="p-1.5 space-y-1.5">
      {/* Header compacto com contagem corrigida */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1">
          <Target className="w-3 h-3 text-primary" />
          <span className="text-xs font-semibold text-foreground">Palavras</span>
        </div>
        <div className="px-1.5 py-0.5 bg-muted rounded-full">
          <span className="text-xs font-bold text-primary">{actualFoundCount}</span>
          <span className="text-xs text-muted-foreground mx-0.5">/</span>
          <span className="text-xs text-muted-foreground">{levelWords.length - hiddenWords.size}</span>
        </div>
      </div>
      
      {/* Grid de palavras sem scroll - layout flexível */}
      <div className="grid grid-cols-1 gap-1">
        {levelWords.map((word, index) => {
          const foundWordIndex = foundWords.findIndex(fw => fw.word === word);
          const isFound = foundWordIndex !== -1;
          const foundWord = foundWords[foundWordIndex];
          const isHidden = hiddenWords.has(word);
          
          return (
            <div 
              key={index}
              className={`
                relative flex items-center justify-between px-2 py-1 rounded-md transition-all duration-200
                ${isFound 
                  ? `bg-gradient-to-r ${getWordColor(foundWordIndex)} text-primary-foreground shadow-sm` 
                  : isHidden
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-primary-foreground'
                    : 'bg-muted border border-border text-muted-foreground'
                }
              `}
            >
              {/* Palavra e ícone */}
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                {isFound && (
                  <CheckCircle className="w-3 h-3 text-primary-foreground/90 flex-shrink-0" />
                )}
                {isHidden && !isFound && (
                  <Lock className="w-3 h-3 text-primary-foreground/90 flex-shrink-0" />
                )}
                <span className="text-xs font-medium truncate">
                  {isHidden && !isFound 
                    ? `${word.length} letras` 
                    : word
                  }
                </span>
              </div>
              
              {/* Pontos ou indicador */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {isFound && foundWord && (
                  <span className="text-[10px] font-semibold text-primary-foreground/90 bg-black/10 px-1 py-0.5 rounded">
                    +{foundWord.points}
                  </span>
                )}
                {isHidden && !isFound && (
                  <span className="text-[10px] font-semibold text-primary-foreground/90 bg-black/10 px-1 py-0.5 rounded">
                    Extra
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Status de conclusão compacto - corrigido para excluir palavras ocultas */}
      {actualFoundCount === (levelWords.length - hiddenWords.size) && (
        <div className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-primary-foreground rounded-md">
          <Star className="w-3 h-3" />
          <span className="text-xs font-semibold">Nível Completo!</span>
        </div>
      )}
    </div>
  );
};

export default WordsList;


import React from 'react';
import { CheckCircle } from 'lucide-react';

interface FoundWord {
  word: string;
  positions: Array<{row: number, col: number}>;
  points: number;
}

interface WordsListProps {
  levelWords: string[];
  foundWords: FoundWord[];
}

const WordsList = ({ levelWords, foundWords }: WordsListProps) => {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-xl shadow-lg p-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-3 text-center">Palavras do Nível</h3>
        <div className="grid grid-cols-5 gap-2">
          {levelWords.map((word, index) => {
            const isFound = foundWords.some(fw => fw.word === word);
            return (
              <div 
                key={index}
                className={`
                  text-center p-2 rounded-lg transition-all duration-300
                  ${isFound 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600'
                  }
                `}
              >
                {isFound && <CheckCircle className="w-3 h-3 mx-auto mb-1" />}
                <div className="text-xs font-medium">{word}</div>
                {isFound && (
                  <div className="text-xs opacity-80">
                    +{foundWords.find(fw => fw.word === word)?.points}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WordsList;


import { useState, useEffect } from 'react';
import { aiService, type WordPosition, type AIGeneratedData } from '@/services/aiService';

export const useGameState = (level: number, board: string[][]) => {
  const [validWords, setValidWords] = useState<WordPosition[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [hintsRemaining, setHintsRemaining] = useState(1);
  const [gameData, setGameData] = useState<AIGeneratedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateGameData = async () => {
      setIsLoading(true);
      try {
        const data = await aiService.generateWordsForBoard(board, level);
        setGameData(data);
        setValidWords(data.validWords);
        setFoundWords([]);
        setHintsRemaining(1);
      } catch (error) {
        console.error('Erro ao gerar dados do jogo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (board.length > 0) {
      generateGameData();
    }
  }, [level, board]);

  const validateWord = (word: string, positions: Array<{row: number, col: number}>): boolean => {
    return aiService.validateWord(word, positions, validWords);
  };

  const addFoundWord = (word: string): boolean => {
    if (foundWords.includes(word)) return false;
    
    setFoundWords(prev => [...prev, word]);
    return true;
  };

  const useHint = (): string | null => {
    if (hintsRemaining <= 0) return null;
    
    const hint = aiService.getHint(validWords.filter(w => !foundWords.includes(w.word)));
    if (hint) {
      setHintsRemaining(prev => prev - 1);
      addFoundWord(hint);
    }
    
    return hint;
  };

  return {
    validWords,
    foundWords,
    hintsRemaining,
    gameData,
    isLoading,
    validateWord,
    addFoundWord,
    useHint
  };
};

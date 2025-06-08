
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WordPosition {
  word: string;
  positions: Array<{row: number, col: number}>;
  direction: 'horizontal' | 'vertical' | 'diagonal';
}

export interface AIGeneratedData {
  validWords: WordPosition[];
  category: string;
  difficulty: string;
}

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
        // Buscar palavras do banco de dados para o nível atual
        const { data: words, error } = await supabase
          .from('level_words')
          .select('word, difficulty, category')
          .eq('level', level)
          .eq('is_active', true)
          .limit(20); // Limitar para não sobrecarregar

        if (error) {
          console.error('Erro ao buscar palavras:', error);
          setValidWords([]);
          setGameData(null);
          return;
        }

        if (!words || words.length === 0) {
          console.log('Nenhuma palavra encontrada para o nível:', level);
          setValidWords([]);
          setGameData(null);
          return;
        }

        // Simular posições das palavras no tabuleiro (isso seria implementado com lógica real de colocação)
        const wordPositions: WordPosition[] = words.map((wordData, index) => ({
          word: wordData.word,
          positions: generateMockPositions(wordData.word, board, index),
          direction: ['horizontal', 'vertical', 'diagonal'][index % 3] as 'horizontal' | 'vertical' | 'diagonal'
        }));

        const data: AIGeneratedData = {
          validWords: wordPositions,
          category: words[0]?.category || 'geral',
          difficulty: words[0]?.difficulty || 'medium'
        };

        setGameData(data);
        setValidWords(wordPositions);
        setFoundWords([]);
        setHintsRemaining(1);
      } catch (error) {
        console.error('Erro ao gerar dados do jogo:', error);
        setValidWords([]);
        setGameData(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (board.length > 0) {
      generateGameData();
    }
  }, [level, board]);

  // Função auxiliar para gerar posições mockadas (seria substituída por lógica real)
  const generateMockPositions = (word: string, board: string[][], index: number) => {
    const positions = [];
    const startRow = Math.min(index, board.length - 1);
    const startCol = 0;
    
    for (let i = 0; i < word.length && startCol + i < board[0]?.length; i++) {
      positions.push({ row: startRow, col: startCol + i });
    }
    
    return positions;
  };

  const validateWord = (word: string, positions: Array<{row: number, col: number}>): boolean => {
    return validWords.some(validWord => 
      validWord.word === word.toUpperCase() && 
      !foundWords.includes(word.toUpperCase())
    );
  };

  const addFoundWord = (word: string): boolean => {
    const upperWord = word.toUpperCase();
    if (foundWords.includes(upperWord)) return false;
    
    setFoundWords(prev => [...prev, upperWord]);
    return true;
  };

  const useHint = (): string | null => {
    if (hintsRemaining <= 0) return null;
    
    const unfoundWords = validWords.filter(w => !foundWords.includes(w.word));
    if (unfoundWords.length === 0) return null;
    
    const hint = unfoundWords[0].word;
    setHintsRemaining(prev => prev - 1);
    addFoundWord(hint);
    
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

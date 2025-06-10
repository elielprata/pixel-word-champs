
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
        console.log('🔍 Buscando palavras ativas para o jogo...');
        
        // Buscar palavras do banco de dados
        const { data: words, error } = await supabase
          .from('level_words')
          .select('word, difficulty, category')
          .eq('is_active', true)
          .limit(15);

        if (error) {
          console.error('❌ Erro ao buscar palavras:', error);
          setValidWords([]);
          setGameData(null);
          return;
        }

        if (!words || words.length === 0) {
          console.log('⚠️ Nenhuma palavra ativa encontrada');
          setValidWords([]);
          setGameData(null);
          return;
        }

        console.log('✅ Palavras encontradas:', words.length);

        // Usar as palavras que foram realmente colocadas no tabuleiro
        const wordPositions: WordPosition[] = [];
        
        // Buscar cada palavra no tabuleiro gerado
        for (const wordData of words.slice(0, 5)) { // Apenas as primeiras 5 palavras
          const positions = findWordInBoard(board, wordData.word);
          if (positions.length > 0) {
            wordPositions.push({
              word: wordData.word,
              positions,
              direction: getDirectionFromPositions(positions)
            });
          }
        }

        const data: AIGeneratedData = {
          validWords: wordPositions,
          category: words[0]?.category || 'geral',
          difficulty: calculateGameDifficulty(words)
        };

        console.log('🎯 Dados do jogo gerados:', {
          palavras: wordPositions.length,
          categoria: data.category,
          dificuldade: data.difficulty
        });

        setGameData(data);
        setValidWords(wordPositions);
        setFoundWords([]);
        setHintsRemaining(Math.max(1, Math.floor(wordPositions.length / 5)));
      } catch (error) {
        console.error('❌ Erro ao gerar dados do jogo:', error);
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

  // Buscar palavra no tabuleiro em todas as direções
  const findWordInBoard = (board: string[][], word: string): Array<{row: number, col: number}> => {
    const size = board.length;
    const directions = [
      { row: 0, col: 1 },   // horizontal
      { row: 1, col: 0 },   // vertical
      { row: 1, col: 1 },   // diagonal
    ];

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        for (const dir of directions) {
          const positions = checkWordAtPosition(board, word, row, col, dir.row, dir.col, size);
          if (positions.length > 0) {
            return positions;
          }
        }
      }
    }
    
    return [];
  };

  // Verificar se a palavra existe na posição específica
  const checkWordAtPosition = (
    board: string[][], 
    word: string, 
    startRow: number, 
    startCol: number, 
    deltaRow: number, 
    deltaCol: number,
    size: number
  ): Array<{row: number, col: number}> => {
    const positions: Array<{row: number, col: number}> = [];
    
    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * deltaRow;
      const col = startCol + i * deltaCol;
      
      if (row < 0 || row >= size || col < 0 || col >= size) {
        return [];
      }
      
      if (board[row][col] !== word[i]) {
        return [];
      }
      
      positions.push({ row, col });
    }
    
    return positions;
  };

  // Determinar direção baseada nas posições
  const getDirectionFromPositions = (positions: Array<{row: number, col: number}>): 'horizontal' | 'vertical' | 'diagonal' => {
    if (positions.length < 2) return 'horizontal';
    
    const deltaRow = positions[1].row - positions[0].row;
    const deltaCol = positions[1].col - positions[0].col;
    
    if (deltaRow === 0) return 'horizontal';
    if (deltaCol === 0) return 'vertical';
    return 'diagonal';
  };

  // Calcular dificuldade do jogo baseada nas palavras
  const calculateGameDifficulty = (words: Array<{difficulty: string}>) => {
    const difficulties = words.map(w => w.difficulty);
    const expertCount = difficulties.filter(d => d === 'expert').length;
    const hardCount = difficulties.filter(d => d === 'hard').length;
    
    if (expertCount > hardCount) return 'expert';
    if (hardCount > 0) return 'hard';
    return 'medium';
  };

  const validateWord = (word: string, positions: Array<{row: number, col: number}>): boolean => {
    const upperWord = word.toUpperCase();
    return validWords.some(validWord => 
      validWord.word === upperWord && 
      !foundWords.includes(upperWord)
    );
  };

  const addFoundWord = (word: string): boolean => {
    const upperWord = word.toUpperCase();
    if (foundWords.includes(upperWord)) return false;
    
    console.log('✅ Palavra encontrada:', upperWord);
    setFoundWords(prev => [...prev, upperWord]);
    return true;
  };

  const useHint = (): string | null => {
    if (hintsRemaining <= 0) return null;
    
    const unfoundWords = validWords.filter(w => !foundWords.includes(w.word));
    if (unfoundWords.length === 0) return null;
    
    const hint = unfoundWords[0].word;
    console.log('💡 Dica usada:', hint);
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

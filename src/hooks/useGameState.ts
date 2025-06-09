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
        
        // Buscar palavras do banco de dados (todas as ativas, sem filtro por nível)
        const { data: words, error } = await supabase
          .from('level_words')
          .select('word, difficulty, category')
          .eq('is_active', true)
          .limit(15); // Limitar para um jogo balanceado

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

        // Calcular posições reais das palavras no tabuleiro
        const wordPositions: WordPosition[] = words.map((wordData, index) => {
          const positions = calculateWordPositions(wordData.word, board, index);
          return {
            word: wordData.word,
            positions,
            direction: getDirectionFromIndex(index)
          };
        }).filter(wp => wp.positions.length > 0); // Remover palavras que não couberem

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
        setHintsRemaining(Math.max(1, Math.floor(wordPositions.length / 5))); // 1 dica para cada 5 palavras
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

  // Calcular posições reais para as palavras no tabuleiro
  const calculateWordPositions = (word: string, board: string[][], index: number) => {
    const positions = [];
    const maxRow = board.length;
    const maxCol = board[0]?.length || 0;
    
    if (maxRow === 0 || maxCol === 0) return [];

    // Tentar posicionamento horizontal
    const startRow = Math.min(index % maxRow, maxRow - 1);
    const startCol = Math.max(0, Math.min(index % maxCol, maxCol - word.length));
    
    // Verificar se a palavra cabe horizontalmente
    if (startCol + word.length <= maxCol) {
      for (let i = 0; i < word.length; i++) {
        positions.push({ row: startRow, col: startCol + i });
      }
    }
    
    return positions;
  };

  // Determinar direção baseada no índice
  const getDirectionFromIndex = (index: number): 'horizontal' | 'vertical' | 'diagonal' => {
    const directions: Array<'horizontal' | 'vertical' | 'diagonal'> = ['horizontal', 'vertical', 'diagonal'];
    return directions[index % 3];
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

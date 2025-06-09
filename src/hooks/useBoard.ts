
import { useState, useCallback, useEffect } from 'react';
import { getBoardSize, type PlacedWord } from '@/utils/boardUtils';
import { BoardGenerator } from '@/utils/boardGenerator';
import { supabase } from '@/integrations/supabase/client';

interface BoardData {
  board: string[][];
  placedWords: PlacedWord[];
}

export const useBoard = (level: number) => {
  const [boardData, setBoardData] = useState<BoardData>({ board: [], placedWords: [] });
  const [levelWords, setLevelWords] = useState<string[]>([]);

  const generateBoard = useCallback((size: number, words: string[]): BoardData => {
    if (words.length === 0) {
      // Gerar um tabuleiro vazio se não houver palavras
      return {
        board: Array(size).fill(null).map(() => Array(size).fill('')),
        placedWords: []
      };
    }
    return BoardGenerator.generateSmartBoard(size, words);
  }, []);

  // Buscar palavras do banco de dados
  useEffect(() => {
    const fetchWords = async () => {
      try {
        console.log('🔍 Buscando palavras para o tabuleiro...');
        
        const { data: words, error } = await supabase
          .from('level_words')
          .select('word')
          .eq('is_active', true)
          .limit(5); // 5 palavras por nível

        if (error) {
          console.error('❌ Erro ao buscar palavras:', error);
          setLevelWords([]);
          return;
        }

        const wordList = words?.map(w => w.word.toUpperCase()) || [];
        console.log('✅ Palavras carregadas:', wordList);
        setLevelWords(wordList);
      } catch (error) {
        console.error('❌ Erro ao carregar palavras:', error);
        setLevelWords([]);
      }
    };

    fetchWords();
  }, [level]);

  // Regenerate board when level or words change
  useEffect(() => {
    const size = getBoardSize(level);
    setBoardData(generateBoard(size, levelWords));
  }, [level, levelWords, generateBoard]);

  const size = getBoardSize(level);

  return {
    boardData,
    size,
    levelWords
  };
};

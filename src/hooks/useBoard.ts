
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
    console.log(`🎮 Gerando tabuleiro para nível ${level} com ${words.length} palavras`);
    
    if (words.length === 0) {
      console.log('📝 Nenhuma palavra disponível, gerando tabuleiro vazio');
      return {
        board: Array(size).fill(null).map(() => Array(size).fill('')),
        placedWords: []
      };
    }
    
    const result = BoardGenerator.generateSmartBoard(size, words);
    console.log(`✅ Tabuleiro gerado: ${result.placedWords.length}/${words.length} palavras colocadas`);
    
    return result;
  }, [level]);

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
          // Usar palavras padrão se houver erro
          const defaultWords = ['CASA', 'SOL', 'GATO', 'LUZ', 'MAR'];
          console.log('🔄 Usando palavras padrão:', defaultWords);
          setLevelWords(defaultWords);
          return;
        }

        const wordList = words?.map(w => w.word.toUpperCase()) || [];
        
        // Se não há palavras no banco, usar palavras padrão
        if (wordList.length === 0) {
          const defaultWords = ['CASA', 'SOL', 'GATO', 'LUZ', 'MAR'];
          console.log('🔄 Nenhuma palavra no banco, usando palavras padrão:', defaultWords);
          setLevelWords(defaultWords);
          return;
        }
        
        console.log('✅ Palavras carregadas:', wordList);
        setLevelWords(wordList);
      } catch (error) {
        console.error('❌ Erro ao carregar palavras:', error);
        // Usar palavras padrão em caso de erro
        const defaultWords = ['CASA', 'SOL', 'GATO', 'LUZ', 'MAR'];
        console.log('🔄 Erro na busca, usando palavras padrão:', defaultWords);
        setLevelWords(defaultWords);
      }
    };

    fetchWords();
  }, [level]);

  // Regenerate board when level or words change
  useEffect(() => {
    if (levelWords.length > 0) {
      const size = getBoardSize(level);
      console.log(`🔄 Regenerando tabuleiro ${size}x${size} para nível ${level}`);
      setBoardData(generateBoard(size, levelWords));
    }
  }, [level, levelWords, generateBoard]);

  const size = getBoardSize(level);

  return {
    boardData,
    size,
    levelWords
  };
};

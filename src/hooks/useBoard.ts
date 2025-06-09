
import { useState, useCallback, useEffect } from 'react';
import { getBoardSize, type PlacedWord } from '@/utils/boardUtils';
import { BoardGenerator } from '@/utils/boardGenerator';
import { supabase } from '@/integrations/supabase/client';

interface BoardData {
  board: string[][];
  placedWords: PlacedWord[];
}

// Função para determinar o tamanho máximo de palavras baseado no tamanho do tabuleiro
const getMaxWordLength = (boardSize: number): number => {
  if (boardSize <= 5) return 4;   // Tabuleiros pequenos: palavras até 4 letras
  if (boardSize <= 6) return 5;   // Tabuleiros médios: palavras até 5 letras
  if (boardSize <= 7) return 6;   // Tabuleiros grandes: palavras até 6 letras
  if (boardSize <= 8) return 7;   // Tabuleiros muito grandes: palavras até 7 letras
  return 8;                       // Tabuleiros máximos: palavras até 8 letras
};

// Função para determinar o tamanho mínimo de palavras baseado no tamanho do tabuleiro
const getMinWordLength = (boardSize: number): number => {
  if (boardSize <= 5) return 3;   // Tabuleiros pequenos: palavras a partir de 3 letras
  if (boardSize <= 7) return 3;   // Tabuleiros médios: palavras a partir de 3 letras
  return 4;                       // Tabuleiros grandes: palavras a partir de 4 letras
};

export const useBoard = (level: number) => {
  const [boardData, setBoardData] = useState<BoardData>({ board: [], placedWords: [] });
  const [levelWords, setLevelWords] = useState<string[]>([]);

  const generateBoard = useCallback((size: number, words: string[]): BoardData => {
    // Sempre gerar um tabuleiro, mesmo se não houver palavras
    if (words.length === 0) {
      console.log('⚠️ Gerando tabuleiro com palavras padrão...');
      const defaultWords = getDefaultWordsForSize(size);
      return BoardGenerator.generateSmartBoard(size, defaultWords);
    }
    return BoardGenerator.generateSmartBoard(size, words);
  }, []);

  // Buscar palavras do banco de dados filtradas por tamanho do tabuleiro
  useEffect(() => {
    const fetchWords = async () => {
      try {
        const size = getBoardSize(level);
        const maxWordLength = getMaxWordLength(size);
        const minWordLength = getMinWordLength(size);
        
        console.log(`🔍 Buscando palavras para nível ${level} (tabuleiro ${size}x${size})`);
        console.log(`📏 Tamanho das palavras: ${minWordLength} a ${maxWordLength} letras`);
        
        // Usar LENGTH() ao invés de char_length() que não existe
        const { data: words, error } = await supabase
          .from('level_words')
          .select('word')
          .eq('is_active', true)
          .gte('LENGTH(word)', minWordLength)
          .lte('LENGTH(word)', maxWordLength)
          .limit(10);

        if (error) {
          console.error('❌ Erro ao buscar palavras:', error);
          const defaultWords = getDefaultWordsForSize(size);
          setLevelWords(defaultWords);
          return;
        }

        let wordList = words?.map(w => w.word.toUpperCase()) || [];
        
        // Se não houver palavras suficientes no banco, usar palavras padrão
        if (wordList.length < 5) {
          console.log('⚠️ Poucas palavras no banco, usando palavras padrão...');
          const defaultWords = getDefaultWordsForSize(size);
          wordList = [...wordList, ...defaultWords].slice(0, 5);
        } else {
          // Selecionar apenas 5 palavras aleatórias
          wordList = wordList.sort(() => Math.random() - 0.5).slice(0, 5);
        }
        
        console.log('✅ Palavras selecionadas:', wordList);
        setLevelWords(wordList);
      } catch (error) {
        console.error('❌ Erro ao carregar palavras:', error);
        const size = getBoardSize(level);
        const defaultWords = getDefaultWordsForSize(size);
        setLevelWords(defaultWords);
      }
    };

    fetchWords();
  }, [level]);

  // Regenerate board when level or words change
  useEffect(() => {
    if (levelWords.length > 0) {
      const size = getBoardSize(level);
      console.log('🎯 Gerando tabuleiro com palavras:', levelWords);
      const newBoardData = generateBoard(size, levelWords);
      console.log('🎲 Tabuleiro gerado:', newBoardData);
      setBoardData(newBoardData);
    }
  }, [level, levelWords, generateBoard]);

  const size = getBoardSize(level);

  return {
    boardData,
    size,
    levelWords
  };
};

// Palavras padrão proporcionais ao tamanho do tabuleiro
const getDefaultWordsForSize = (boardSize: number): string[] => {
  if (boardSize <= 5) {
    return ['SOL', 'LUA', 'MAR', 'CÉU', 'RIO'];
  }
  if (boardSize <= 6) {
    return ['CASA', 'AMOR', 'VIDA', 'TERRA', 'FLOR'];
  }
  if (boardSize <= 7) {
    return ['AMIGO', 'TEMPO', 'MUNDO', 'SONHO', 'PEACE'];
  }
  if (boardSize <= 8) {
    return ['FAMILIA', 'ALEGRIA', 'ESPERANCA', 'CORAGEM', 'VITORIA'];
  }
  return ['FELICIDADE', 'AVENTURA', 'LIBERDADE', 'HARMONIA', 'SUCESSO'];
};

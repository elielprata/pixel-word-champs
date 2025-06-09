
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

// Mapeamento de dificuldades por tamanho de palavra
const getDifficultyByLength = (length: number): string => {
  if (length === 3) return 'easy';
  if (length === 4) return 'medium';
  if (length >= 5 && length <= 6) return 'hard';
  return 'expert';
};

// Distribuição desejada por dificuldade
const DIFFICULTY_DISTRIBUTION = {
  easy: 2,    // 2 palavras fáceis
  medium: 1,  // 1 palavra média
  hard: 1,    // 1 palavra difícil
  expert: 1   // 1 palavra expert
};

// Storage de palavras já usadas (simula um estado global)
let usedWordsAcrossLevels: Set<string> = new Set();

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

  // Buscar palavras do banco de dados com distribuição balanceada
  useEffect(() => {
    const fetchBalancedWords = async () => {
      try {
        const size = getBoardSize(level);
        const maxWordLength = getMaxWordLength(size);
        const minWordLength = getMinWordLength(size);
        
        console.log(`🔍 Buscando palavras para nível ${level} (tabuleiro ${size}x${size})`);
        console.log(`📏 Tamanho das palavras: ${minWordLength} a ${maxWordLength} letras`);
        console.log(`🚫 Palavras já usadas: ${usedWordsAcrossLevels.size}`);
        
        // Buscar todas as palavras ativas do banco que se encaixam no tamanho do tabuleiro
        const { data: allWords, error } = await supabase
          .from('level_words')
          .select('word, difficulty')
          .eq('is_active', true)
          .gte('LENGTH(word)', minWordLength)
          .lte('LENGTH(word)', maxWordLength);

        if (error) {
          console.error('❌ Erro ao buscar palavras:', error);
          const defaultWords = getDefaultWordsForSize(size);
          setLevelWords(defaultWords);
          return;
        }

        if (!allWords || allWords.length === 0) {
          console.log('⚠️ Nenhuma palavra encontrada no banco');
          const defaultWords = getDefaultWordsForSize(size);
          setLevelWords(defaultWords);
          return;
        }

        // Filtrar palavras que ainda não foram usadas
        const availableWords = allWords.filter(w => 
          !usedWordsAcrossLevels.has(w.word.toUpperCase())
        );

        if (availableWords.length < 5) {
          console.log('⚠️ Poucas palavras disponíveis, resetando lista de usadas...');
          usedWordsAcrossLevels.clear();
          availableWords.push(...allWords);
        }

        // Separar por dificuldade
        const wordsByDifficulty = {
          easy: availableWords.filter(w => w.difficulty === 'easy'),
          medium: availableWords.filter(w => w.difficulty === 'medium'),
          hard: availableWords.filter(w => w.difficulty === 'hard'),
          expert: availableWords.filter(w => w.difficulty === 'expert')
        };

        // Se não houver palavras com dificuldade definida, categorizar por tamanho
        if (Object.values(wordsByDifficulty).every(arr => arr.length === 0)) {
          console.log('🔄 Categorizando palavras por tamanho...');
          availableWords.forEach(word => {
            const difficulty = getDifficultyByLength(word.word.length);
            if (!wordsByDifficulty[difficulty as keyof typeof wordsByDifficulty]) {
              wordsByDifficulty[difficulty as keyof typeof wordsByDifficulty] = [];
            }
            wordsByDifficulty[difficulty as keyof typeof wordsByDifficulty].push(word);
          });
        }

        // Selecionar palavras seguindo a distribuição desejada
        const selectedWords: string[] = [];
        
        for (const [difficulty, count] of Object.entries(DIFFICULTY_DISTRIBUTION)) {
          const difficultyWords = wordsByDifficulty[difficulty as keyof typeof wordsByDifficulty] || [];
          
          // Embaralhar e pegar as primeiras palavras da dificuldade
          const shuffled = difficultyWords.sort(() => Math.random() - 0.5);
          const needed = Math.min(count, shuffled.length);
          
          for (let i = 0; i < needed; i++) {
            selectedWords.push(shuffled[i].word.toUpperCase());
          }
        }

        // Se não conseguimos 5 palavras, completar com palavras aleatórias disponíveis
        while (selectedWords.length < 5 && availableWords.length > selectedWords.length) {
          const remainingWords = availableWords.filter(w => 
            !selectedWords.includes(w.word.toUpperCase())
          );
          
          if (remainingWords.length === 0) break;
          
          const randomWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
          selectedWords.push(randomWord.word.toUpperCase());
        }

        // Se ainda não temos 5 palavras, usar palavras padrão
        if (selectedWords.length < 5) {
          console.log('⚠️ Insuficientes palavras no banco, usando padrão...');
          const defaultWords = getDefaultWordsForSize(size);
          selectedWords.push(...defaultWords.filter(w => !selectedWords.includes(w)));
        }

        // Limitar a 5 palavras e adicionar à lista de usadas
        const finalWords = selectedWords.slice(0, 5);
        finalWords.forEach(word => usedWordsAcrossLevels.add(word));
        
        console.log('✅ Palavras selecionadas para nível', level, ':', finalWords);
        console.log('📊 Distribuição:', {
          easy: finalWords.filter(w => getDifficultyByLength(w.length) === 'easy').length,
          medium: finalWords.filter(w => getDifficultyByLength(w.length) === 'medium').length,
          hard: finalWords.filter(w => getDifficultyByLength(w.length) === 'hard').length,
          expert: finalWords.filter(w => getDifficultyByLength(w.length) === 'expert').length
        });
        
        setLevelWords(finalWords);
      } catch (error) {
        console.error('❌ Erro ao carregar palavras:', error);
        const size = getBoardSize(level);
        const defaultWords = getDefaultWordsForSize(size);
        setLevelWords(defaultWords);
      }
    };

    fetchBalancedWords();
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

// Palavras padrão proporcionais ao tamanho do tabuleiro com distribuição balanceada
const getDefaultWordsForSize = (boardSize: number): string[] => {
  if (boardSize <= 5) {
    // 2 fáceis (3 letras), 1 média (4 letras), 1 difícil (5 letras), 1 expert (6 letras)
    return ['SOL', 'LUA', 'CASA', 'MUNDO', 'FAMÍLIA'];
  }
  if (boardSize <= 6) {
    return ['CÉU', 'MAR', 'AMOR', 'TEMPO', 'ALEGRIA'];
  }
  if (boardSize <= 7) {
    return ['RIO', 'PAZ', 'VIDA', 'SONHO', 'CORAGEM'];
  }
  if (boardSize <= 8) {
    return ['LUZ', 'FÉ', 'TERRA', 'AMIGO', 'VITÓRIA'];
  }
  return ['FIM', 'SIM', 'FLOR', 'PEACE', 'ESPERANÇA'];
};

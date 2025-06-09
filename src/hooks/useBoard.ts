
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
  // A palavra não pode ser maior que o tamanho do tabuleiro
  // Deixando uma margem de segurança para colocação
  return Math.min(boardSize - 1, 8); // Máximo de 8 letras mesmo em tabuleiros grandes
};

// Função para determinar o tamanho mínimo de palavras baseado no tamanho do tabuleiro
const getMinWordLength = (boardSize: number): number => {
  if (boardSize <= 5) return 3;   // Tabuleiros pequenos: palavras a partir de 3 letras
  if (boardSize <= 7) return 3;   // Tabuleiros médios: palavras a partir de 3 letras
  return 3;                       // Sempre pelo menos 3 letras
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
        
        // Buscar palavras que se encaixam no tamanho do tabuleiro
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

        // Filtrar palavras que ainda não foram usadas e que cabem no tabuleiro
        const availableWords = allWords.filter(w => 
          !usedWordsAcrossLevels.has(w.word.toUpperCase()) &&
          w.word.length <= maxWordLength &&
          w.word.length >= minWordLength
        );

        if (availableWords.length < 5) {
          console.log('⚠️ Poucas palavras disponíveis, resetando lista de usadas...');
          usedWordsAcrossLevels.clear();
          // Refilter sem a restrição de palavras usadas
          availableWords.length = 0;
          availableWords.push(...allWords.filter(w => 
            w.word.length <= maxWordLength && w.word.length >= minWordLength
          ));
        }

        // Separar por dificuldade
        const wordsByDifficulty = {
          easy: availableWords.filter(w => w.difficulty === 'easy' || w.word.length === 3),
          medium: availableWords.filter(w => w.difficulty === 'medium' || w.word.length === 4),
          hard: availableWords.filter(w => w.difficulty === 'hard' || (w.word.length >= 5 && w.word.length <= 6)),
          expert: availableWords.filter(w => w.difficulty === 'expert' || w.word.length >= 7)
        };

        // Se não houver palavras com dificuldade definida, categorizar por tamanho
        if (Object.values(wordsByDifficulty).every(arr => arr.length === 0)) {
          console.log('🔄 Categorizando palavras por tamanho...');
          availableWords.forEach(word => {
            const difficulty = getDifficultyByLength(word.word.length);
            if (wordsByDifficulty[difficulty as keyof typeof wordsByDifficulty]) {
              wordsByDifficulty[difficulty as keyof typeof wordsByDifficulty].push(word);
            }
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

        // Se não conseguimos 5 palavras, completar com palavras menores disponíveis
        while (selectedWords.length < 5 && availableWords.length > selectedWords.length) {
          const remainingWords = availableWords.filter(w => 
            !selectedWords.includes(w.word.toUpperCase()) &&
            w.word.length <= maxWordLength
          );
          
          if (remainingWords.length === 0) break;
          
          // Priorizar palavras menores se não temos 5 palavras
          const sortedRemaining = remainingWords.sort((a, b) => a.word.length - b.word.length);
          selectedWords.push(sortedRemaining[0].word.toUpperCase());
        }

        // Se ainda não temos 5 palavras, usar palavras padrão adequadas ao tamanho
        if (selectedWords.length < 5) {
          console.log('⚠️ Insuficientes palavras no banco, usando padrão...');
          const defaultWords = getDefaultWordsForSize(size);
          selectedWords.push(...defaultWords.filter(w => 
            !selectedWords.includes(w) && w.length <= maxWordLength
          ));
        }

        // Limitar a 5 palavras e verificar se todas cabem no tabuleiro
        const finalWords = selectedWords
          .filter(word => word.length <= maxWordLength)
          .slice(0, 5);
        
        // Adicionar à lista de usadas
        finalWords.forEach(word => usedWordsAcrossLevels.add(word));
        
        console.log('✅ Palavras selecionadas para nível', level, ':', finalWords);
        console.log('📊 Tamanhos das palavras:', finalWords.map(w => `${w}(${w.length})`));
        console.log('📊 Distribuição:', {
          easy: finalWords.filter(w => w.length === 3).length,
          medium: finalWords.filter(w => w.length === 4).length,
          hard: finalWords.filter(w => w.length >= 5 && w.length <= 6).length,
          expert: finalWords.filter(w => w.length >= 7).length
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

// Palavras padrão proporcionais ao tamanho do tabuleiro garantindo que cabem
const getDefaultWordsForSize = (boardSize: number): string[] => {
  const maxLength = Math.min(boardSize - 1, 8);
  
  if (boardSize === 5) {
    // Nível 1: 5x5 - palavras até 4 letras
    return ['SOL', 'LUA', 'CASA', 'AMOR', 'VIDA'];
  }
  if (boardSize === 6) {
    // Nível 2: 6x6 - palavras até 5 letras
    return ['CÉU', 'MAR', 'TERRA', 'MUNDO', 'TEMPO'];
  }
  if (boardSize === 7) {
    // Nível 3: 7x7 - palavras até 6 letras
    return ['RIO', 'PAZ', 'SONHO', 'ALEGRIA', 'AMIGO'];
  }
  if (boardSize === 8) {
    // Nível 4: 8x8 - palavras até 7 letras
    return ['LUZ', 'FÉ', 'CORAGEM', 'VITÓRIA', 'FAMÍLIA'];
  }
  
  // Para níveis maiores, sempre garantir que as palavras cabem
  return ['FIM', 'SIM', 'FLOR', 'ESPERANÇA', 'SABEDORIA'].filter(w => w.length <= maxLength);
};

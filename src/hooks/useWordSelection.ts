
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  getMaxWordLength, 
  getMinWordLength, 
  filterAvailableWords, 
  categorizeWordsByDifficulty 
} from '@/utils/wordFiltering';
import { DIFFICULTY_DISTRIBUTION, getDefaultWordsForSize } from '@/utils/levelConfiguration';
import { getBoardSize } from '@/utils/boardUtils';

// Storage de palavras já usadas (simula um estado global)
let usedWordsAcrossLevels: Set<string> = new Set();

export const useWordSelection = (level: number) => {
  const [levelWords, setLevelWords] = useState<string[]>([]);

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

        // Filtrar palavras disponíveis
        let availableWords = filterAvailableWords(
          allWords, 
          usedWordsAcrossLevels, 
          maxWordLength, 
          minWordLength
        );

        if (availableWords.length < 5) {
          console.log('⚠️ Poucas palavras disponíveis, resetando lista de usadas...');
          usedWordsAcrossLevels.clear();
          availableWords = filterAvailableWords(
            allWords, 
            usedWordsAcrossLevels, 
            maxWordLength, 
            minWordLength
          );
        }

        // Categorizar por dificuldade
        const wordsByDifficulty = categorizeWordsByDifficulty(availableWords);

        // Selecionar palavras seguindo a distribuição desejada
        const selectedWords = selectWordsWithDistribution(wordsByDifficulty, availableWords, maxWordLength);
        
        // Adicionar à lista de usadas
        selectedWords.forEach(word => usedWordsAcrossLevels.add(word));
        
        console.log('✅ Palavras selecionadas para nível', level, ':', selectedWords);
        console.log('📊 Tamanhos das palavras:', selectedWords.map(w => `${w}(${w.length})`));
        console.log('📊 Distribuição:', {
          easy: selectedWords.filter(w => w.length === 3).length,
          medium: selectedWords.filter(w => w.length === 4).length,
          hard: selectedWords.filter(w => w.length >= 5 && w.length <= 6).length,
          expert: selectedWords.filter(w => w.length >= 7).length
        });
        
        setLevelWords(selectedWords);
      } catch (error) {
        console.error('❌ Erro ao carregar palavras:', error);
        const size = getBoardSize(level);
        const defaultWords = getDefaultWordsForSize(size);
        setLevelWords(defaultWords);
      }
    };

    fetchBalancedWords();
  }, [level]);

  return { levelWords };
};

const selectWordsWithDistribution = (
  wordsByDifficulty: Record<string, Array<{ word: string; difficulty: string }>>,
  availableWords: Array<{ word: string; difficulty: string }>,
  maxWordLength: number
): string[] => {
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
    const boardSize = Math.sqrt(maxWordLength + 1); // Aproximação reversa
    const defaultWords = getDefaultWordsForSize(boardSize);
    selectedWords.push(...defaultWords.filter(w => 
      !selectedWords.includes(w) && w.length <= maxWordLength
    ));
  }

  // Limitar a 5 palavras e verificar se todas cabem no tabuleiro
  return selectedWords
    .filter(word => word.length <= maxWordLength)
    .slice(0, 5);
};

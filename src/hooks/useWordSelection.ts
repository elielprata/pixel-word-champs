
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getBoardSize } from '@/utils/boardUtils';
import { DIFFICULTY_DISTRIBUTION } from '@/utils/levelConfiguration';
import { wordHistoryService } from '@/services/wordHistoryService';

export const useWordSelection = (level: number) => {
  const [levelWords, setLevelWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const selectWordsForLevel = async () => {
      setIsLoading(true);
      try {
        const boardSize = getBoardSize(level);
        const maxWordLength = Math.min(boardSize - 1, 8); // Garantir que palavras cabem no tabuleiro
        
        console.log(`🎯 Selecionando palavras para nível ${level} - Tabuleiro: ${boardSize}x${boardSize}, Máx palavra: ${maxWordLength} letras`);

        // Buscar palavras ativas que cabem no tabuleiro
        const { data: words, error } = await supabase
          .from('level_words')
          .select('word, difficulty, category')
          .eq('is_active', true)
          .lte('length(word)', maxWordLength) // Filtrar por tamanho da palavra
          .gte('length(word)', 3); // Mínimo 3 letras

        if (error) {
          console.error('❌ Erro ao buscar palavras:', error);
          setLevelWords([]);
          return;
        }

        if (!words || words.length === 0) {
          console.log('⚠️ Nenhuma palavra encontrada que caiba no tabuleiro');
          setLevelWords([]);
          return;
        }

        console.log(`📊 ${words.length} palavras disponíveis para tabuleiro ${boardSize}x${boardSize}`);

        // Filtrar palavras por dificuldade disponível
        const wordsByDifficulty = {
          easy: words.filter(w => w.difficulty === 'easy'),
          medium: words.filter(w => w.difficulty === 'medium'),
          hard: words.filter(w => w.difficulty === 'hard'),
          expert: words.filter(w => w.difficulty === 'expert')
        };

        // Selecionar palavras seguindo a distribuição desejada
        const selectedWords: string[] = [];
        const categories = new Set<string>();

        // Tentar seguir a distribuição ideal
        for (const [difficulty, count] of Object.entries(DIFFICULTY_DISTRIBUTION)) {
          const availableWords = wordsByDifficulty[difficulty as keyof typeof wordsByDifficulty] || [];
          
          for (let i = 0; i < count && selectedWords.length < 5; i++) {
            // Buscar palavra de categoria diferente se possível
            const candidateWords = availableWords.filter(w => 
              !selectedWords.includes(w.word) && 
              !categories.has(w.category)
            );
            
            const fallbackWords = availableWords.filter(w => 
              !selectedWords.includes(w.word)
            );
            
            const wordsToChooseFrom = candidateWords.length > 0 ? candidateWords : fallbackWords;
            
            if (wordsToChooseFrom.length > 0) {
              const randomWord = wordsToChooseFrom[Math.floor(Math.random() * wordsToChooseFrom.length)];
              selectedWords.push(randomWord.word);
              categories.add(randomWord.category);
            }
          }
        }

        // Se não conseguiu 5 palavras, completar com quaisquer palavras disponíveis
        while (selectedWords.length < 5 && selectedWords.length < words.length) {
          const remainingWords = words.filter(w => !selectedWords.includes(w.word));
          if (remainingWords.length === 0) break;
          
          const randomWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
          selectedWords.push(randomWord.word);
        }

        console.log(`✅ Selecionadas ${selectedWords.length} palavras para nível ${level}:`, selectedWords);
        console.log(`📏 Tamanhos das palavras:`, selectedWords.map(w => `${w}(${w.length})`));

        // Registrar uso das palavras
        if (selectedWords.length > 0) {
          await wordHistoryService.recordWordUsage(selectedWords);
        }

        setLevelWords(selectedWords);
      } catch (error) {
        console.error('❌ Erro ao selecionar palavras:', error);
        setLevelWords([]);
      } finally {
        setIsLoading(false);
      }
    };

    selectWordsForLevel();
  }, [level]);

  return { levelWords, isLoading };
};

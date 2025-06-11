
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getBoardSize } from '@/utils/boardUtils';
import { DIFFICULTY_DISTRIBUTION } from '@/utils/levelConfiguration';
import { wordHistoryService } from '@/services/wordHistoryService';

export const useWordSelection = (level: number, category?: string) => {
  const [levelWords, setLevelWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const selectWordsForLevel = async () => {
      setIsLoading(true);
      try {
        const boardSize = getBoardSize(level);
        const maxWordLength = Math.min(boardSize - 1, 8);
        
        console.log(`🎯 Selecionando palavras para nível ${level} - Tabuleiro: ${boardSize}x${boardSize}, Máx palavra: ${maxWordLength} letras${category ? `, Categoria: ${category}` : ''}`);

        // Construir query base
        let query = supabase
          .from('level_words')
          .select('word, difficulty, category')
          .eq('is_active', true);

        // Filtrar por categoria se especificada
        if (category) {
          query = query.eq('category', category);
          console.log(`🏷️ Filtrando palavras pela categoria: ${category}`);
        }

        const { data: words, error } = await query;

        if (error) {
          console.error('❌ Erro ao buscar palavras:', error);
          setLevelWords([]);
          return;
        }

        if (!words || words.length === 0) {
          console.log(`⚠️ Nenhuma palavra ativa encontrada${category ? ` para a categoria ${category}` : ''}`);
          setLevelWords([]);
          return;
        }

        console.log(`📊 ${words.length} palavras ativas encontradas${category ? ` na categoria ${category}` : ''}`);

        // Filtrar palavras por tamanho usando JavaScript
        const validWords = words.filter(w => 
          w.word.length >= 3 && w.word.length <= maxWordLength
        );

        if (validWords.length === 0) {
          console.log(`⚠️ Nenhuma palavra encontrada que caiba no tabuleiro ${boardSize}x${boardSize}${category ? ` na categoria ${category}` : ''}`);
          setLevelWords([]);
          return;
        }

        console.log(`📏 ${validWords.length} palavras válidas para tabuleiro ${boardSize}x${boardSize}${category ? ` na categoria ${category}` : ''}`);

        // Filtrar palavras por dificuldade disponível
        const wordsByDifficulty = {
          easy: validWords.filter(w => w.difficulty === 'easy'),
          medium: validWords.filter(w => w.difficulty === 'medium'),
          hard: validWords.filter(w => w.difficulty === 'hard'),
          expert: validWords.filter(w => w.difficulty === 'expert')
        };

        // Selecionar palavras seguindo a distribuição desejada
        const selectedWords: string[] = [];
        const categories = new Set<string>();

        // Tentar seguir a distribuição ideal
        for (const [difficulty, count] of Object.entries(DIFFICULTY_DISTRIBUTION)) {
          const availableWords = wordsByDifficulty[difficulty as keyof typeof wordsByDifficulty] || [];
          
          for (let i = 0; i < count && selectedWords.length < 5; i++) {
            // Se não há filtro de categoria, buscar palavra de categoria diferente se possível
            const candidateWords = !category ? availableWords.filter(w => 
              !selectedWords.includes(w.word) && 
              !categories.has(w.category)
            ) : availableWords.filter(w => !selectedWords.includes(w.word));
            
            const fallbackWords = availableWords.filter(w => 
              !selectedWords.includes(w.word)
            );
            
            const wordsToChooseFrom = candidateWords.length > 0 ? candidateWords : fallbackWords;
            
            if (wordsToChooseFrom.length > 0) {
              const randomWord = wordsToChooseFrom[Math.floor(Math.random() * wordsToChooseFrom.length)];
              selectedWords.push(randomWord.word);
              if (!category) {
                categories.add(randomWord.category);
              }
            }
          }
        }

        // Se não conseguiu 5 palavras, completar com quaisquer palavras disponíveis
        while (selectedWords.length < 5 && selectedWords.length < validWords.length) {
          const remainingWords = validWords.filter(w => !selectedWords.includes(w.word));
          if (remainingWords.length === 0) break;
          
          const randomWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
          selectedWords.push(randomWord.word);
        }

        console.log(`✅ Selecionadas ${selectedWords.length} palavras para nível ${level}${category ? ` da categoria ${category}` : ''}:`, selectedWords);
        console.log(`📏 Tamanhos das palavras:`, selectedWords.map(w => `${w}(${w.length})`));

        // Registrar uso das palavras
        if (selectedWords.length > 0) {
          await wordHistoryService.recordWordsUsage('system', selectedWords, level);
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
  }, [level, category]);

  return { levelWords, isLoading };
};


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
        const maxWordLength = Math.min(boardSize - 1, 8);
        
        console.log(`🎯 Selecionando palavras para nível ${level} - Tabuleiro: ${boardSize}x${boardSize}, Máx palavra: ${maxWordLength} letras`);

        // Buscar palavras ativas do banco de dados
        const { data: words, error } = await supabase
          .from('level_words')
          .select('word, difficulty, category')
          .eq('is_active', true);

        if (error) {
          console.error('❌ Erro ao buscar palavras:', error);
          setLevelWords([]);
          return;
        }

        if (!words || words.length === 0) {
          console.log('⚠️ Nenhuma palavra ativa encontrada no banco');
          setLevelWords([]);
          return;
        }

        console.log(`📊 ${words.length} palavras ativas encontradas`);

        // Filtrar palavras por tamanho válido para o tabuleiro
        const validWords = words.filter(w => 
          w.word && 
          w.word.length >= 3 && 
          w.word.length <= maxWordLength &&
          /^[A-Za-z]+$/.test(w.word) // Apenas letras
        );

        if (validWords.length === 0) {
          console.log(`⚠️ Nenhuma palavra válida encontrada para tabuleiro ${boardSize}x${boardSize}`);
          setLevelWords([]);
          return;
        }

        console.log(`📏 ${validWords.length} palavras válidas para tabuleiro ${boardSize}x${boardSize}`);

        // Agrupar palavras por dificuldade
        const wordsByDifficulty = {
          easy: validWords.filter(w => w.difficulty === 'easy'),
          medium: validWords.filter(w => w.difficulty === 'medium'),
          hard: validWords.filter(w => w.difficulty === 'hard'),
          expert: validWords.filter(w => w.difficulty === 'expert')
        };

        // Se não há palavras categorizadas por dificuldade, categorizar por tamanho
        if (Object.values(wordsByDifficulty).every(arr => arr.length === 0)) {
          console.log('🔄 Categorizando palavras por tamanho...');
          validWords.forEach(word => {
            let difficulty = 'medium';
            if (word.word.length === 3) difficulty = 'easy';
            else if (word.word.length === 4) difficulty = 'medium';
            else if (word.word.length >= 5 && word.word.length <= 6) difficulty = 'hard';
            else if (word.word.length >= 7) difficulty = 'expert';
            
            wordsByDifficulty[difficulty as keyof typeof wordsByDifficulty].push(word);
          });
        }

        // Selecionar palavras seguindo a distribuição desejada
        const selectedWords: string[] = [];
        const usedCategories = new Set<string>();

        // Tentar seguir a distribuição ideal
        for (const [difficulty, count] of Object.entries(DIFFICULTY_DISTRIBUTION)) {
          const availableWords = wordsByDifficulty[difficulty as keyof typeof wordsByDifficulty] || [];
          console.log(`🎲 Selecionando ${count} palavras de dificuldade ${difficulty} (${availableWords.length} disponíveis)`);
          
          for (let i = 0; i < count && selectedWords.length < 5; i++) {
            // Priorizar palavras de categorias diferentes
            let candidateWords = availableWords.filter(w => 
              !selectedWords.includes(w.word) && 
              !usedCategories.has(w.category || 'geral')
            );
            
            // Se não há palavras de categorias diferentes, usar qualquer palavra disponível
            if (candidateWords.length === 0) {
              candidateWords = availableWords.filter(w => !selectedWords.includes(w.word));
            }
            
            if (candidateWords.length > 0) {
              const randomWord = candidateWords[Math.floor(Math.random() * candidateWords.length)];
              selectedWords.push(randomWord.word.toUpperCase());
              if (randomWord.category) {
                usedCategories.add(randomWord.category);
              }
              console.log(`✅ Selecionada: ${randomWord.word} (${difficulty}, categoria: ${randomWord.category || 'geral'})`);
            }
          }
        }

        // Se não conseguiu 5 palavras, completar com quaisquer palavras válidas
        while (selectedWords.length < 5 && selectedWords.length < validWords.length) {
          const remainingWords = validWords.filter(w => !selectedWords.includes(w.word.toUpperCase()));
          if (remainingWords.length === 0) break;
          
          const randomWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
          selectedWords.push(randomWord.word.toUpperCase());
          console.log(`🔄 Completando com: ${randomWord.word} (categoria: ${randomWord.category || 'geral'})`);
        }

        console.log(`✅ Selecionadas ${selectedWords.length} palavras para nível ${level}:`, selectedWords);
        console.log(`📏 Tamanhos das palavras:`, selectedWords.map(w => `${w}(${w.length})`));

        // Validar que todas as palavras cabem no tabuleiro
        const invalidWords = selectedWords.filter(word => word.length > maxWordLength);
        if (invalidWords.length > 0) {
          console.error(`❌ ERRO: Palavras selecionadas que não cabem no tabuleiro:`, invalidWords);
          // Filtrar palavras inválidas
          const finalWords = selectedWords.filter(word => word.length <= maxWordLength);
          setLevelWords(finalWords);
        } else {
          setLevelWords(selectedWords);
        }

        // Registrar uso das palavras
        if (selectedWords.length > 0) {
          await wordHistoryService.recordWordsUsage('system', selectedWords, level);
        }
        
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

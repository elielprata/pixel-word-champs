
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getBoardSize } from '@/utils/boardUtils';
import { DIFFICULTY_DISTRIBUTION } from '@/utils/levelConfiguration';
import { wordHistoryService } from '@/services/wordHistoryService';
import { logger } from '@/utils/logger';

export const useWordSelection = (level: number) => {
  const [levelWords, setLevelWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const selectWordsForLevel = async () => {
      setIsLoading(true);
      setError(null);
      setDebugInfo('Iniciando seleção de palavras...');
      
      // Timeout de segurança - forçar fallback após 10 segundos
      timeoutRef.current = setTimeout(() => {
        logger.warn('Timeout na seleção de palavras - usando fallback', { level }, 'WORD_SELECTION');
        setDebugInfo('Timeout - usando palavras padrão');
        setLevelWords(getDefaultWordsForLevel(level));
        setIsLoading(false);
      }, 10000);

      try {
        const boardSize = getBoardSize(level);
        const maxWordLength = Math.min(boardSize - 1, 8);
        
        logger.info('Iniciando seleção de palavras', { 
          level, 
          boardSize, 
          maxWordLength 
        }, 'WORD_SELECTION');
        
        setDebugInfo(`Buscando palavras para nível ${level} (tabuleiro ${boardSize}x${boardSize})`);

        // Tentar buscar palavras do banco
        const { data: words, error: dbError } = await supabase
          .from('level_words')
          .select('word, difficulty, category')
          .eq('is_active', true);

        if (dbError) {
          logger.error('Erro ao buscar palavras do banco', { error: dbError }, 'WORD_SELECTION');
          throw new Error(`Erro no banco: ${dbError.message}`);
        }

        if (!words || words.length === 0) {
          logger.warn('Nenhuma palavra encontrada no banco - usando fallback', { level }, 'WORD_SELECTION');
          setDebugInfo('Banco vazio - usando palavras padrão');
          setLevelWords(getDefaultWordsForLevel(level));
          setIsLoading(false);
          clearTimeout(timeoutRef.current);
          return;
        }

        setDebugInfo(`Encontradas ${words.length} palavras no banco`);
        logger.info(`Encontradas ${words.length} palavras no banco`, undefined, 'WORD_SELECTION');

        // Filtrar palavras válidas
        const validWords = words.filter(w => {
          if (!w.word || typeof w.word !== 'string') return false;
          if (w.word.length < 3 || w.word.length > maxWordLength) return false;
          if (!/^[A-Za-z]+$/.test(w.word)) return false;
          return true;
        });

        if (validWords.length === 0) {
          logger.warn('Nenhuma palavra válida após filtros - usando fallback', { 
            totalWords: words.length,
            maxWordLength 
          }, 'WORD_SELECTION');
          setDebugInfo('Nenhuma palavra válida - usando palavras padrão');
          setLevelWords(getDefaultWordsForLevel(level));
          setIsLoading(false);
          clearTimeout(timeoutRef.current);
          return;
        }

        setDebugInfo(`${validWords.length} palavras válidas encontradas`);
        logger.info(`${validWords.length} palavras válidas após filtros`, undefined, 'WORD_SELECTION');

        // Tentar usar seleção inteligente com histórico
        let selectedWords: string[] = [];
        
        try {
          setDebugInfo('Tentando seleção inteligente...');
          
          // Obter usuário atual
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            selectedWords = await wordHistoryService.selectRandomizedWords({
              userId: user.id,
              level,
              maxWordsNeeded: 5
            });
            
            if (selectedWords.length >= 5) {
              logger.info('Seleção inteligente bem-sucedida', { 
                wordsCount: selectedWords.length 
              }, 'WORD_SELECTION');
              setDebugInfo(`Seleção inteligente: ${selectedWords.length} palavras`);
              setLevelWords(selectedWords);
              setIsLoading(false);
              clearTimeout(timeoutRef.current);
              return;
            }
          }
        } catch (smartSelectionError) {
          logger.warn('Erro na seleção inteligente - usando seleção simples', { 
            error: smartSelectionError 
          }, 'WORD_SELECTION');
          setDebugInfo('Seleção inteligente falhou - usando seleção simples');
        }

        // Fallback: seleção simples por distribuição de dificuldade
        setDebugInfo('Usando seleção simples por dificuldade...');
        selectedWords = selectWordsByDifficulty(validWords);

        if (selectedWords.length === 0) {
          logger.warn('Seleção por dificuldade falhou - usando seleção aleatória', undefined, 'WORD_SELECTION');
          setDebugInfo('Seleção por dificuldade falhou - seleção aleatória');
          selectedWords = selectRandomWords(validWords, 5);
        }

        if (selectedWords.length === 0) {
          logger.error('Todas as seleções falharam - usando palavras padrão', undefined, 'WORD_SELECTION');
          setDebugInfo('Todas as seleções falharam - usando palavras padrão');
          selectedWords = getDefaultWordsForLevel(level);
        }

        // Validar que as palavras cabem no tabuleiro
        const finalWords = selectedWords.filter(word => word.length <= maxWordLength);
        
        if (finalWords.length < selectedWords.length) {
          logger.warn('Algumas palavras removidas por tamanho', { 
            original: selectedWords.length,
            final: finalWords.length 
          }, 'WORD_SELECTION');
        }

        logger.info('Seleção de palavras concluída', { 
          level,
          wordsCount: finalWords.length,
          words: finalWords 
        }, 'WORD_SELECTION');

        setDebugInfo(`Concluído: ${finalWords.length} palavras selecionadas`);
        setLevelWords(finalWords);
        
        // Tentar registrar histórico (opcional - não falhar se der erro)
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user && finalWords.length > 0) {
            await wordHistoryService.recordWordsUsage(user.id, finalWords, level);
          }
        } catch (historyError) {
          logger.warn('Erro ao registrar histórico - continuando', { error: historyError }, 'WORD_SELECTION');
        }
        
      } catch (error) {
        logger.error('Erro crítico na seleção de palavras', { error }, 'WORD_SELECTION');
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        setDebugInfo(`Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`);
        
        // Fallback final: palavras padrão
        const fallbackWords = getDefaultWordsForLevel(level);
        logger.info('Usando fallback final', { words: fallbackWords }, 'WORD_SELECTION');
        setLevelWords(fallbackWords);
      } finally {
        setIsLoading(false);
        clearTimeout(timeoutRef.current);
      }
    };

    selectWordsForLevel();

    // Cleanup do timeout
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [level]);

  return { levelWords, isLoading, error, debugInfo };
};

// Função para seleção por distribuição de dificuldade
const selectWordsByDifficulty = (words: Array<{ word: string; difficulty: string }>): string[] => {
  const wordsByDifficulty = {
    easy: words.filter(w => w.difficulty === 'easy'),
    medium: words.filter(w => w.difficulty === 'medium'),
    hard: words.filter(w => w.difficulty === 'hard'),
    expert: words.filter(w => w.difficulty === 'expert')
  };

  const selected: string[] = [];

  // Tentar seguir a distribuição ideal
  for (const [difficulty, count] of Object.entries(DIFFICULTY_DISTRIBUTION)) {
    const availableWords = wordsByDifficulty[difficulty as keyof typeof wordsByDifficulty] || [];
    
    for (let i = 0; i < count && selected.length < 5; i++) {
      const candidateWords = availableWords.filter(w => !selected.includes(w.word.toUpperCase()));
      
      if (candidateWords.length > 0) {
        const randomWord = candidateWords[Math.floor(Math.random() * candidateWords.length)];
        selected.push(randomWord.word.toUpperCase());
      }
    }
  }

  return selected;
};

// Função para seleção aleatória simples
const selectRandomWords = (words: Array<{ word: string }>, count: number): string[] => {
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(w => w.word.toUpperCase());
};

// Função para palavras padrão quando tudo falha
const getDefaultWordsForLevel = (level: number): string[] => {
  const defaultWords = [
    'CASA', 'AMOR', 'VIDA', 'TEMPO', 'MUNDO',
    'ÁGUA', 'TERRA', 'FOGO', 'VENTO', 'PEDRA',
    'FLOR', 'ÁRVORE', 'PÁSSARO', 'GATO', 'CACHORRO'
  ];
  
  const boardSize = getBoardSize(level);
  const maxLength = Math.min(boardSize - 1, 8);
  
  const validDefaults = defaultWords.filter(word => word.length <= maxLength);
  
  return validDefaults.slice(0, 5);
};

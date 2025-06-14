
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getBoardSize } from '@/utils/boardUtils';
import { normalizeText, isValidGameWord } from '@/utils/levelConfiguration';
import { wordHistoryService } from '@/services/wordHistoryService';
import { logger } from '@/utils/logger';
import { useIsMobile } from './use-mobile';

interface CachedWords {
  words: Array<{ word: string; difficulty: string; category: string }>;
  timestamp: number;
  level: number;
}

// Cache de 3 minutos para palavras
const CACHE_DURATION = 3 * 60 * 1000;
let wordsCache: CachedWords | null = null;

export const useOptimizedWordSelection = (level: number) => {
  const [levelWords, setLevelWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('Iniciando...');
  const timeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    const selectWordsOptimized = async () => {
      setIsLoading(true);
      setError(null);
      setLoadingStep('Preparando seleção...');
      retryCountRef.current = 0;
      
      logger.info('🚀 Seleção otimizada iniciada', { 
        level, 
        isMobile,
        cacheExists: !!wordsCache 
      }, 'OPTIMIZED_WORD_SELECTION');
      
      // Timeout reduzido para 3 segundos
      timeoutRef.current = setTimeout(() => {
        logger.error('⏰ Timeout na seleção otimizada', { level, isMobile }, 'OPTIMIZED_WORD_SELECTION');
        setError('Tempo limite excedido. Verifique sua conexão.');
        setIsLoading(false);
      }, 3000);

      try {
        const boardSize = getBoardSize(level);
        const maxWordLength = Math.min(boardSize - 1, 8);
        
        logger.info('📏 Configuração otimizada', { 
          level, 
          boardSize, 
          maxWordLength,
          isMobile 
        }, 'OPTIMIZED_WORD_SELECTION');
        
        setLoadingStep('Buscando palavras...');

        // Verificar cache primeiro
        if (wordsCache && 
            Date.now() - wordsCache.timestamp < CACHE_DURATION &&
            wordsCache.level === level) {
          logger.info('💾 Usando cache de palavras', { level, isMobile }, 'OPTIMIZED_WORD_SELECTION');
          setLoadingStep('Processando cache...');
          const selectedWords = await processWordsFromCache(wordsCache.words, maxWordLength);
          setLevelWords(selectedWords);
          setIsLoading(false);
          clearTimeout(timeoutRef.current);
          return;
        }

        // Query otimizada - filtrar no servidor
        logger.info('🔍 Executando query otimizada', undefined, 'OPTIMIZED_WORD_SELECTION');
        const { data: words, error: dbError } = await supabase
          .from('level_words')
          .select('word, difficulty, category')
          .eq('is_active', true)
          .gte('LENGTH(word)', 3) // Mínimo 3 letras
          .lte('LENGTH(word)', maxWordLength) // Máximo baseado no tabuleiro
          .limit(50); // Limitar quantidade para performance

        if (dbError) {
          throw new Error(`Erro na consulta: ${dbError.message}`);
        }

        if (!words || words.length === 0) {
          throw new Error('Nenhuma palavra encontrada no banco de dados');
        }

        // Atualizar cache
        wordsCache = {
          words: words,
          timestamp: Date.now(),
          level: level
        };

        setLoadingStep('Selecionando palavras...');
        logger.info(`📊 Query otimizada retornou ${words.length} palavras`, { isMobile }, 'OPTIMIZED_WORD_SELECTION');

        const selectedWords = await processWordsFromCache(words, maxWordLength);
        setLevelWords(selectedWords);
        
        // Registrar histórico se possível
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user && selectedWords.length > 0) {
            await wordHistoryService.recordWordsUsage(user.id, selectedWords, level);
          }
        } catch (historyError) {
          logger.warn('⚠️ Erro ao registrar histórico (não crítico)', { error: historyError }, 'OPTIMIZED_WORD_SELECTION');
        }
        
        logger.info('✅ Seleção otimizada concluída', { 
          level,
          wordsCount: selectedWords.length,
          isMobile 
        }, 'OPTIMIZED_WORD_SELECTION');
        
      } catch (error) {
        logger.error('❌ Erro na seleção otimizada', { error, level, isMobile }, 'OPTIMIZED_WORD_SELECTION');
        
        // Retry uma vez se for erro de rede
        if (retryCountRef.current === 0 && 
            (error instanceof Error && error.message.includes('network'))) {
          retryCountRef.current++;
          logger.info('🔄 Tentando novamente...', { level, isMobile }, 'OPTIMIZED_WORD_SELECTION');
          setLoadingStep('Tentando novamente...');
          setTimeout(() => selectWordsOptimized(), 1000);
          return;
        }
        
        setError(error instanceof Error ? error.message : 'Erro desconhecido na seleção de palavras');
      } finally {
        setIsLoading(false);
        clearTimeout(timeoutRef.current);
      }
    };

    selectWordsOptimized();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [level, isMobile]);

  return { levelWords, isLoading, error, loadingStep };
};

// Função para processar palavras (cache ou query)
const processWordsFromCache = async (
  words: Array<{ word: string; difficulty: string; category: string }>,
  maxWordLength: number
): Promise<string[]> => {
  // Filtrar e normalizar palavras válidas
  const validWords = words
    .filter(w => w.word && typeof w.word === 'string')
    .map(w => ({
      ...w,
      normalizedWord: normalizeText(w.word)
    }))
    .filter(w => isValidGameWord(w.normalizedWord, maxWordLength));

  if (validWords.length === 0) {
    throw new Error('Nenhuma palavra válida encontrada');
  }

  // Seleção simples por distribuição de dificuldade
  const wordsByDifficulty = {
    easy: validWords.filter(w => w.difficulty === 'easy'),
    medium: validWords.filter(w => w.difficulty === 'medium'),
    hard: validWords.filter(w => w.difficulty === 'hard'),
    expert: validWords.filter(w => w.difficulty === 'expert')
  };

  const selected: string[] = [];
  const distribution = { expert: 1, hard: 2, medium: 1, easy: 1 }; // Total: 5 palavras

  // Tentar seguir a distribuição
  for (const [difficulty, count] of Object.entries(distribution)) {
    const availableWords = wordsByDifficulty[difficulty as keyof typeof wordsByDifficulty] || [];
    
    for (let i = 0; i < count && selected.length < 5; i++) {
      const candidateWords = availableWords.filter(w => !selected.includes(w.normalizedWord));
      
      if (candidateWords.length > 0) {
        const randomWord = candidateWords[Math.floor(Math.random() * candidateWords.length)];
        selected.push(randomWord.normalizedWord);
      }
    }
  }

  // Se não conseguiu 5 palavras, completar com aleatórias
  if (selected.length < 5) {
    const remainingWords = validWords
      .filter(w => !selected.includes(w.normalizedWord))
      .sort(() => Math.random() - 0.5);
    
    for (const word of remainingWords) {
      if (selected.length >= 5) break;
      selected.push(word.normalizedWord);
    }
  }

  if (selected.length === 0) {
    throw new Error('Falha ao selecionar palavras válidas');
  }

  return selected;
};

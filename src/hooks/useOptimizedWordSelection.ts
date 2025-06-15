
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
  processedData: Map<number, string[]>; // Cache processado por maxWordLength
}

interface ProcessingMetrics {
  totalWords: number;
  validWords: number;
  processingTime: number;
  cacheHit: boolean;
}

// Cache global otimizado - 15 minutos para 2000+ palavras
const CACHE_DURATION = 15 * 60 * 1000;
const MAX_CACHE_SIZE = 3000; // Suporta até 3000 palavras
let globalWordsCache: CachedWords | null = null;

export const useOptimizedWordSelection = (level: number) => {
  const [levelWords, setLevelWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('Iniciando...');
  const [metrics, setMetrics] = useState<ProcessingMetrics | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    const selectWordsOptimized = async () => {
      const startTime = performance.now();
      setIsLoading(true);
      setError(null);
      setLoadingStep('Preparando seleção otimizada...');
      retryCountRef.current = 0;
      
      logger.info('🚀 Seleção híbrida otimizada iniciada', { 
        level, 
        isMobile,
        cacheExists: !!globalWordsCache,
        targetWords: 5
      }, 'OPTIMIZED_WORD_SELECTION');
      
      // Timeout otimizado para escala - 5 segundos para primeira carga
      const timeoutMs = globalWordsCache ? 2000 : 5000;
      timeoutRef.current = setTimeout(() => {
        logger.error('⏰ Timeout na seleção otimizada', { level, isMobile, timeoutMs }, 'OPTIMIZED_WORD_SELECTION');
        setError('Tempo limite excedido. Tentando cache local...');
        setIsLoading(false);
      }, timeoutMs);

      try {
        const boardSize = getBoardSize(level);
        const maxWordLength = Math.min(boardSize - 1, 8);
        
        logger.info('📏 Configuração híbrida', { 
          level, 
          boardSize, 
          maxWordLength,
          isMobile,
          cacheAge: globalWordsCache ? Date.now() - globalWordsCache.timestamp : 0
        }, 'OPTIMIZED_WORD_SELECTION');
        
        setLoadingStep('Verificando cache global...');

        // 1. CACHE INTELIGENTE - Verificar cache global primeiro
        if (globalWordsCache && 
            Date.now() - globalWordsCache.timestamp < CACHE_DURATION) {
          
          // Verificar se já temos dados processados para este tamanho
          if (globalWordsCache.processedData.has(maxWordLength)) {
            const cachedWords = globalWordsCache.processedData.get(maxWordLength)!;
            logger.info('⚡ Cache global direto', { 
              level, 
              isMobile,
              maxWordLength,
              cachedWordsCount: cachedWords.length
            }, 'OPTIMIZED_WORD_SELECTION');
            
            setLevelWords(cachedWords);
            setMetrics({
              totalWords: globalWordsCache.words.length,
              validWords: cachedWords.length,
              processingTime: performance.now() - startTime,
              cacheHit: true
            });
            setIsLoading(false);
            clearTimeout(timeoutRef.current);
            return;
          }
          
          // Cache existe mas não processado para este tamanho - processar
          logger.info('🔄 Processando cache existente', { maxWordLength, isMobile }, 'OPTIMIZED_WORD_SELECTION');
          setLoadingStep('Processando palavras do cache...');
          
          const selectedWords = await processWordsOptimized(globalWordsCache.words, maxWordLength);
          
          // Armazenar resultado processado no cache
          globalWordsCache.processedData.set(maxWordLength, selectedWords);
          
          setLevelWords(selectedWords);
          setMetrics({
            totalWords: globalWordsCache.words.length,
            validWords: selectedWords.length,
            processingTime: performance.now() - startTime,
            cacheHit: true
          });
          setIsLoading(false);
          clearTimeout(timeoutRef.current);
          return;
        }

        // 2. QUERY OTIMIZADA - Buscar do banco com estratégia híbrida
        setLoadingStep('Carregando palavras do banco...');
        logger.info('🔍 Executando query otimizada para escala', { 
          maxCacheSize: MAX_CACHE_SIZE 
        }, 'OPTIMIZED_WORD_SELECTION');
        
        const { data: words, error: dbError } = await supabase
          .from('level_words')
          .select('word, difficulty, category') // Apenas colunas necessárias
          .eq('is_active', true)
          .limit(MAX_CACHE_SIZE) // Suporte a até 3000 palavras
          .order('created_at', { ascending: false }); // Palavras mais recentes primeiro

        if (dbError) {
          throw new Error(`Erro na consulta otimizada: ${dbError.message}`);
        }

        if (!words || words.length === 0) {
          throw new Error('Nenhuma palavra encontrada no banco de dados');
        }

        // 3. PROCESSAMENTO ASSÍNCRONO
        setLoadingStep(`Processando ${words.length} palavras...`);
        logger.info(`📊 Query híbrida retornou ${words.length} palavras`, { 
          maxCacheSize: MAX_CACHE_SIZE,
          isMobile 
        }, 'OPTIMIZED_WORD_SELECTION');

        // Processar palavras com otimização assíncrona
        const selectedWords = await processWordsOptimized(words, maxWordLength);

        // 4. CACHE GLOBAL INTELIGENTE - Atualizar cache com dados processados
        globalWordsCache = {
          words: words,
          timestamp: Date.now(),
          processedData: new Map([[maxWordLength, selectedWords]])
        };
        
        setLevelWords(selectedWords);
        setMetrics({
          totalWords: words.length,
          validWords: selectedWords.length,
          processingTime: performance.now() - startTime,
          cacheHit: false
        });

        // 5. BACKGROUND TASKS - Registrar histórico sem bloquear
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user && selectedWords.length > 0) {
            // Background task - não esperar
            setTimeout(() => {
              wordHistoryService.recordWordsUsage(user.id, selectedWords, level)
                .catch(error => logger.warn('⚠️ Erro no histórico (background)', { error }, 'OPTIMIZED_WORD_SELECTION'));
            }, 0);
          }
        } catch (historyError) {
          logger.warn('⚠️ Erro ao configurar histórico em background', { error: historyError }, 'OPTIMIZED_WORD_SELECTION');
        }
        
        logger.info('✅ Seleção híbrida concluída', { 
          level,
          wordsCount: selectedWords.length,
          totalProcessed: words.length,
          processingTime: performance.now() - startTime,
          isMobile 
        }, 'OPTIMIZED_WORD_SELECTION');
        
      } catch (error) {
        logger.error('❌ Erro na seleção híbrida', { error, level, isMobile }, 'OPTIMIZED_WORD_SELECTION');
        
        // FALLBACK INTELIGENTE - Tentar cache antigo se disponível
        if (globalWordsCache && globalWordsCache.words.length > 0) {
          logger.info('🆘 Usando cache antigo como fallback', { 
            cacheAge: Date.now() - globalWordsCache.timestamp,
            wordsCount: globalWordsCache.words.length 
          }, 'OPTIMIZED_WORD_SELECTION');
          
          setLoadingStep('Usando cache de emergência...');
          try {
            const boardSize = getBoardSize(level);
            const maxWordLength = Math.min(boardSize - 1, 8);
            const selectedWords = await processWordsOptimized(globalWordsCache.words, maxWordLength);
            
            setLevelWords(selectedWords);
            setError(null); // Limpar erro já que conseguimos usar cache
            setMetrics({
              totalWords: globalWordsCache.words.length,
              validWords: selectedWords.length,
              processingTime: performance.now() - startTime,
              cacheHit: true
            });
          } catch (fallbackError) {
            logger.error('❌ Erro no fallback de cache', { fallbackError }, 'OPTIMIZED_WORD_SELECTION');
            setError('Erro na seleção de palavras. Tente novamente.');
          }
        } else {
          // Retry uma vez para erros de rede
          if (retryCountRef.current === 0 && 
              (error instanceof Error && error.message.includes('network'))) {
            retryCountRef.current++;
            logger.info('🔄 Tentando novamente...', { level, isMobile }, 'OPTIMIZED_WORD_SELECTION');
            setLoadingStep('Tentando novamente...');
            setTimeout(() => selectWordsOptimized(), 1000);
            return;
          }
          
          setError(error instanceof Error ? error.message : 'Erro desconhecido na seleção de palavras');
        }
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

  return { levelWords, isLoading, error, loadingStep, metrics };
};

// PROCESSAMENTO OTIMIZADO ASSÍNCRONO
const processWordsOptimized = async (
  words: Array<{ word: string; difficulty: string; category: string }>,
  maxWordLength: number
): Promise<string[]> => {
  // Processar em chunks para não bloquear a UI
  const CHUNK_SIZE = 500;
  const chunks = [];
  
  for (let i = 0; i < words.length; i += CHUNK_SIZE) {
    chunks.push(words.slice(i, i + CHUNK_SIZE));
  }
  
  let validWords: Array<{ word: string; difficulty: string; category: string; normalizedWord: string }> = [];
  
  // Processar cada chunk com pequeno delay para não bloquear
  for (const chunk of chunks) {
    const chunkValid = chunk
      .filter(w => w.word && typeof w.word === 'string')
      .map(w => ({
        ...w,
        normalizedWord: normalizeText(w.word)
      }))
      .filter(w => isValidGameWord(w.normalizedWord, maxWordLength));
    
    validWords = validWords.concat(chunkValid);
    
    // Pequeno delay para não bloquear a UI
    if (chunks.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  if (validWords.length === 0) {
    throw new Error('Nenhuma palavra válida encontrada após processamento');
  }

  // DISTRIBUIÇÃO INTELIGENTE POR DIFICULDADE
  const wordsByDifficulty = {
    easy: validWords.filter(w => w.difficulty === 'easy'),
    medium: validWords.filter(w => w.difficulty === 'medium'),
    hard: validWords.filter(w => w.difficulty === 'hard'),
    expert: validWords.filter(w => w.difficulty === 'expert')
  };

  const selected: string[] = [];
  const distribution = { expert: 1, hard: 2, medium: 1, easy: 1 }; // Total: 5 palavras

  // Seleção balanceada com fallback inteligente
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

  // Completar com palavras aleatórias se necessário
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
    throw new Error('Falha ao selecionar palavras válidas após processamento otimizado');
  }

  return selected;
};

// BACKGROUND CACHE WARMING (pode ser chamado na home)
export const warmWordsCache = async (): Promise<void> => {
  if (globalWordsCache && Date.now() - globalWordsCache.timestamp < CACHE_DURATION) {
    return; // Cache ainda válido
  }
  
  try {
    logger.info('🔥 Warming cache em background', undefined, 'CACHE_WARMING');
    
    const { data: words } = await supabase
      .from('level_words')
      .select('word, difficulty, category')
      .eq('is_active', true)
      .limit(MAX_CACHE_SIZE);
    
    if (words && words.length > 0) {
      globalWordsCache = {
        words: words,
        timestamp: Date.now(),
        processedData: new Map()
      };
      
      logger.info('✅ Cache warming concluído', { wordsCount: words.length }, 'CACHE_WARMING');
    }
  } catch (error) {
    logger.warn('⚠️ Erro no cache warming', { error }, 'CACHE_WARMING');
  }
};

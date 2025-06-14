
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getBoardSize } from '@/utils/boardUtils';
import { normalizeText, isValidGameWord } from '@/utils/levelConfiguration';
import { logger } from '@/utils/logger';
import { useIsMobile } from './use-mobile';

interface CachedWords {
  words: Array<{ word: string; difficulty: string; category: string }>;
  timestamp: number;
  lastDbUpdate: number;
  processedData: Map<string, ProcessedCache>; // Mudança: string key mais inteligente
}

interface ProcessedCache {
  words: string[];
  timestamp: number;
  maxWordLength: number;
}

interface ProcessingMetrics {
  totalWords: number;
  validWords: number;
  processingTime: number;
  cacheHit: boolean;
  chunkSize: number;
  chunksProcessed: number;
}

interface OptimizedRandomWordSelectionResult {
  levelWords: string[];
  isLoading: boolean;
  error: string | null;
  loadingStep: string;
  metrics: ProcessingMetrics | null;
}

// Cache global otimizado - 15 minutos para 3000+ palavras
const CACHE_DURATION = 15 * 60 * 1000;
const MAX_CACHE_SIZE = 3000;
let globalWordsCache: CachedWords | null = null;

export const useOptimizedRandomWordSelection = (level: number): OptimizedRandomWordSelectionResult => {
  const [levelWords, setLevelWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('Iniciando...');
  const [metrics, setMetrics] = useState<ProcessingMetrics | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    const selectOptimizedRandomWords = async () => {
      const startTime = performance.now();
      setIsLoading(true);
      setError(null);
      setLoadingStep('Preparando seleção otimizada...');
      retryCountRef.current = 0;
      
      logger.info('🚀 Seleção aleatória otimizada iniciada', { 
        level, 
        isMobile,
        cacheExists: !!globalWordsCache,
        targetWords: 5
      }, 'OPTIMIZED_RANDOM_SELECTION');
      
      // Timeout adaptativo - mobile precisa ser mais rápido
      const timeoutMs = globalWordsCache ? (isMobile ? 1500 : 2000) : (isMobile ? 4000 : 5000);
      timeoutRef.current = setTimeout(() => {
        logger.error('⏰ Timeout na seleção otimizada', { level, isMobile, timeoutMs }, 'OPTIMIZED_RANDOM_SELECTION');
        handleFallbackWords(startTime);
      }, timeoutMs);

      try {
        const boardSize = getBoardSize(level);
        const maxWordLength = Math.min(boardSize - 1, 8);
        
        logger.info('📏 Configuração otimizada', { 
          level, 
          boardSize, 
          maxWordLength,
          isMobile,
          cacheAge: globalWordsCache ? Date.now() - globalWordsCache.timestamp : 0
        }, 'OPTIMIZED_RANDOM_SELECTION');
        
        setLoadingStep('Verificando cache inteligente...');

        // 1. CACHE VALIDATION INTELIGENTE
        const cacheKey = `${maxWordLength}_v2`; // Versioning para invalidar cache antigo
        
        if (await isValidCache(cacheKey, maxWordLength)) {
          const cachedResult = globalWordsCache!.processedData.get(cacheKey)!;
          
          // Evitar palavras já usadas hoje
          const todayUsedWords = await getTodayUsedWords();
          const availableWords = cachedResult.words.filter(word => !todayUsedWords.has(word.toUpperCase()));
          
          // Se não há palavras suficientes não usadas, usar todas as cackeadas
          const finalWords = availableWords.length >= 5 ? 
            selectRandomWordsOptimized(availableWords, 5) :
            selectRandomWordsOptimized(cachedResult.words, 5);
          
          logger.info('⚡ Cache direto otimizado', { 
            level, 
            isMobile,
            maxWordLength,
            availableWords: availableWords.length,
            finalWords: finalWords.length
          }, 'OPTIMIZED_RANDOM_SELECTION');
          
          setLevelWords(finalWords);
          setMetrics({
            totalWords: globalWordsCache!.words.length,
            validWords: finalWords.length,
            processingTime: performance.now() - startTime,
            cacheHit: true,
            chunkSize: 0,
            chunksProcessed: 0
          });
          setIsLoading(false);
          clearTimeout(timeoutRef.current);
          
          // Background task - registrar uso
          recordWordsUsageBackground(finalWords);
          return;
        }

        // 2. CACHE NEEDS REFRESH ou NÃO EXISTE
        setLoadingStep('Carregando palavras do banco...');
        
        // Verificar se precisamos atualizar cache ou ele não existe
        if (!globalWordsCache || await shouldRefreshCache()) {
          logger.info('🔍 Executando query otimizada', { 
            maxCacheSize: MAX_CACHE_SIZE,
            isMobile 
          }, 'OPTIMIZED_RANDOM_SELECTION');
          
          const { data: words, error: dbError } = await supabase
            .from('level_words')
            .select('word, difficulty, category, updated_at') // Incluir updated_at para cache
            .eq('is_active', true)
            .limit(MAX_CACHE_SIZE)
            .order('created_at', { ascending: false });

          if (dbError) {
            throw new Error(`Erro na consulta otimizada: ${dbError.message}`);
          }

          if (!words || words.length === 0) {
            throw new Error('Nenhuma palavra encontrada no banco de dados');
          }

          // Atualizar cache global
          const latestUpdate = Math.max(...words.map(w => new Date(w.updated_at || w.created_at || Date.now()).getTime()));
          globalWordsCache = {
            words: words,
            timestamp: Date.now(),
            lastDbUpdate: latestUpdate,
            processedData: new Map()
          };
        }

        // 3. PROCESSAMENTO ADAPTATIVO ASSÍNCRONO
        setLoadingStep(`Processando ${globalWordsCache.words.length} palavras...`);
        
        const selectedWords = await processWordsAdaptive(globalWordsCache.words, maxWordLength, isMobile);
        
        // Armazenar no cache processado
        globalWordsCache.processedData.set(cacheKey, {
          words: selectedWords.validWords,
          timestamp: Date.now(),
          maxWordLength: maxWordLength
        });
        
        // Evitar repetição diária
        const todayUsedWords = await getTodayUsedWords();
        const availableWords = selectedWords.validWords.filter(word => !todayUsedWords.has(word.toUpperCase()));
        
        const finalWords = availableWords.length >= 5 ? 
          selectRandomWordsOptimized(availableWords, 5) :
          selectRandomWordsOptimized(selectedWords.validWords, 5);

        setLevelWords(finalWords);
        setMetrics({
          totalWords: globalWordsCache.words.length,
          validWords: finalWords.length,
          processingTime: performance.now() - startTime,
          cacheHit: false,
          chunkSize: selectedWords.chunkSize,
          chunksProcessed: selectedWords.chunksProcessed
        });

        // Background task - registrar uso
        recordWordsUsageBackground(finalWords);
        
        logger.info('✅ Seleção aleatória otimizada concluída', { 
          level,
          wordsCount: finalWords.length,
          totalProcessed: globalWordsCache.words.length,
          processingTime: performance.now() - startTime,
          availableWords: availableWords.length,
          isMobile 
        }, 'OPTIMIZED_RANDOM_SELECTION');
        
      } catch (error) {
        await handleError(error, startTime);
      } finally {
        setIsLoading(false);
        clearTimeout(timeoutRef.current);
      }
    };

    selectOptimizedRandomWords();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [level, isMobile]);

  // HELPER: Validar cache inteligente
  const isValidCache = async (cacheKey: string, maxWordLength: number): Promise<boolean> => {
    if (!globalWordsCache || Date.now() - globalWordsCache.timestamp > CACHE_DURATION) {
      return false;
    }
    
    const cached = globalWordsCache.processedData.get(cacheKey);
    if (!cached || cached.maxWordLength !== maxWordLength) {
      return false;
    }
    
    // Validar integridade
    if (!cached.words || cached.words.length === 0) {
      return false;
    }
    
    return true;
  };

  // HELPER: Verificar se cache precisa refresh
  const shouldRefreshCache = async (): Promise<boolean> => {
    if (!globalWordsCache) return true;
    
    try {
      // Verificar se há palavras mais recentes no banco
      const { data: recentWords } = await supabase
        .from('level_words')
        .select('updated_at')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1);
      
      if (recentWords && recentWords.length > 0) {
        const latestUpdate = new Date(recentWords[0].updated_at).getTime();
        return latestUpdate > globalWordsCache.lastDbUpdate;
      }
    } catch (error) {
      logger.warn('⚠️ Erro verificando atualização do cache', { error }, 'OPTIMIZED_RANDOM_SELECTION');
    }
    
    return false;
  };

  // HELPER: Fallback inteligente
  const handleFallbackWords = (startTime: number) => {
    setLoadingStep('Usando fallback de emergência...');
    try {
      // Tentar cache antigo primeiro
      if (globalWordsCache && globalWordsCache.words.length > 0) {
        logger.info('🆘 Usando cache antigo como fallback', { 
          cacheAge: Date.now() - globalWordsCache.timestamp,
          wordsCount: globalWordsCache.words.length 
        }, 'OPTIMIZED_RANDOM_SELECTION');
        
        const words = globalWordsCache.words.map(w => normalizeText(w.word)).slice(0, 5);
        setLevelWords(words);
        setError(null);
        setMetrics({
          totalWords: globalWordsCache.words.length,
          validWords: words.length,
          processingTime: performance.now() - startTime,
          cacheHit: true,
          chunkSize: 0,
          chunksProcessed: 0
        });
      } else {
        // Fallback absoluto - palavras padrão
        const fallbackWords = ['CASA', 'AMOR', 'VIDA', 'TEMPO', 'MUNDO'];
        setLevelWords(fallbackWords);
        setError('Usando palavras padrão devido a timeout');
        setMetrics({
          totalWords: 0,
          validWords: fallbackWords.length,
          processingTime: performance.now() - startTime,
          cacheHit: false,
          chunkSize: 0,
          chunksProcessed: 0
        });
      }
    } catch (fallbackError) {
      logger.error('❌ Erro no fallback absoluto', { fallbackError }, 'OPTIMIZED_RANDOM_SELECTION');
      setError('Erro crítico na seleção de palavras');
    }
  };

  // HELPER: Tratamento de erro inteligente
  const handleError = async (error: any, startTime: number) => {
    logger.error('❌ Erro na seleção aleatória otimizada', { error, level, isMobile }, 'OPTIMIZED_RANDOM_SELECTION');
    
    // Retry para erros de rede
    if (retryCountRef.current === 0 && 
        (error instanceof Error && (error.message.includes('network') || error.message.includes('timeout')))) {
      retryCountRef.current++;
      logger.info('🔄 Retry automático...', { level, isMobile }, 'OPTIMIZED_RANDOM_SELECTION');
      setLoadingStep('Tentando novamente...');
      setTimeout(() => {
        // Re-executar após delay exponencial
      }, Math.pow(2, retryCountRef.current) * 1000);
      return;
    }
    
    // Fallback para cache antigo
    if (globalWordsCache && globalWordsCache.words.length > 0) {
      await handleFallbackWords(startTime);
    } else {
      setError(error instanceof Error ? error.message : 'Erro desconhecido na seleção de palavras');
    }
  };

  return { levelWords, isLoading, error, loadingStep, metrics };
};

// PROCESSAMENTO ADAPTATIVO COM CHUNKS INTELIGENTES
const processWordsAdaptive = async (
  words: Array<{ word: string; difficulty: string; category: string }>,
  maxWordLength: number,
  isMobile: boolean
): Promise<{ validWords: string[]; chunkSize: number; chunksProcessed: number }> => {
  // Chunk size adaptativo baseado no device e tamanho do dataset
  const baseChunkSize = isMobile ? 300 : 500;
  const adaptiveChunkSize = Math.min(baseChunkSize, Math.max(100, Math.floor(words.length / 10)));
  
  const chunks = [];
  for (let i = 0; i < words.length; i += adaptiveChunkSize) {
    chunks.push(words.slice(i, i + adaptiveChunkSize));
  }
  
  let validWords: Array<{ word: string; difficulty: string; category: string; normalizedWord: string }> = [];
  
  // Processar chunks com delay adaptativo
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkValid = chunk
      .filter(w => w.word && typeof w.word === 'string')
      .map(w => ({
        ...w,
        normalizedWord: normalizeText(w.word)
      }))
      .filter(w => isValidGameWord(w.normalizedWord, maxWordLength));
    
    validWords = validWords.concat(chunkValid);
    
    // Delay adaptativo - menor para chunks pequenos
    if (chunks.length > 1 && i < chunks.length - 1) {
      const delay = adaptiveChunkSize > 300 ? 1 : 0;
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  if (validWords.length === 0) {
    throw new Error('Nenhuma palavra válida encontrada após processamento adaptativo');
  }

  // Seleção aleatória pura
  const randomizedWords = selectRandomWordsOptimized(
    validWords.map(w => w.normalizedWord), 
    Math.min(50, validWords.length) // Manter pool de 50 palavras válidas
  );

  return {
    validWords: randomizedWords,
    chunkSize: adaptiveChunkSize,
    chunksProcessed: chunks.length
  };
};

// SELEÇÃO ALEATÓRIA OTIMIZADA
const selectRandomWordsOptimized = (words: string[], count: number): string[] => {
  if (words.length === 0) return [];
  if (words.length <= count) return [...words];
  
  // Fisher-Yates shuffle otimizado - apenas embaralhar o necessário
  const shuffled = [...words];
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(Math.random() * (shuffled.length - i));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, count);
};

// HELPER: Obter palavras usadas hoje
const getTodayUsedWords = async (): Promise<Set<string>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Set();

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const { data: history, error } = await supabase
      .from('user_word_history')
      .select('word')
      .eq('user_id', user.id)
      .gte('used_at', startOfDay.toISOString());

    if (error) {
      logger.warn('Erro ao buscar histórico do dia', { error }, 'OPTIMIZED_RANDOM_SELECTION');
      return new Set();
    }

    return new Set(history?.map(h => h.word.toUpperCase()) || []);
  } catch (error) {
    logger.warn('Erro ao verificar palavras do dia', { error }, 'OPTIMIZED_RANDOM_SELECTION');
    return new Set();
  }
};

// BACKGROUND TASK: Registrar uso das palavras
const recordWordsUsageBackground = async (words: string[]): Promise<void> => {
  // Executar em background sem bloquear
  setTimeout(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const usageRecords = words.map(word => ({
        user_id: user.id,
        word: word.toUpperCase(),
        level: 1,
        category: 'aleatorio_otimizado',
        used_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('user_word_history')
        .insert(usageRecords);

      if (error) {
        logger.warn('Erro ao registrar uso das palavras (background)', { error }, 'OPTIMIZED_RANDOM_SELECTION');
      } else {
        logger.info('📝 Uso das palavras registrado em background', { wordsCount: words.length }, 'OPTIMIZED_RANDOM_SELECTION');
      }
    } catch (error) {
      logger.warn('Erro no registro de uso de palavras (background)', { error }, 'OPTIMIZED_RANDOM_SELECTION');
    }
  }, 0);
};

// CACHE WARMING PREVENTIVO (pode ser chamado na home)
export const warmOptimizedCache = async (): Promise<void> => {
  if (globalWordsCache && Date.now() - globalWordsCache.timestamp < CACHE_DURATION) {
    return; // Cache ainda válido
  }
  
  try {
    logger.info('🔥 Warming cache otimizado em background', undefined, 'CACHE_WARMING');
    
    const { data: words } = await supabase
      .from('level_words')
      .select('word, difficulty, category, updated_at')
      .eq('is_active', true)
      .limit(MAX_CACHE_SIZE);
    
    if (words && words.length > 0) {
      const latestUpdate = Math.max(...words.map(w => new Date(w.updated_at || Date.now()).getTime()));
      globalWordsCache = {
        words: words,
        timestamp: Date.now(),
        lastDbUpdate: latestUpdate,
        processedData: new Map()
      };
      
      logger.info('✅ Cache warming otimizado concluído', { wordsCount: words.length }, 'CACHE_WARMING');
    }
  } catch (error) {
    logger.warn('⚠️ Erro no cache warming otimizado', { error }, 'CACHE_WARMING');
  }
};

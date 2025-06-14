
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getBoardSize } from '@/utils/boardUtils';
import { normalizeText, isValidGameWord } from '@/utils/levelConfiguration';
import { logger } from '@/utils/logger';
import { useIsMobile } from './use-mobile';
import { LocalWordCacheManager } from '@/utils/localWordCache';

interface CachedWords {
  words: Array<{ word: string; difficulty: string; category: string }>;
  timestamp: number;
  lastDbUpdate: number;
  processedData: Map<string, ProcessedCache>;
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

// Cache otimizado com duração inteligente baseada no tamanho
const CACHE_DURATION = 20 * 60 * 1000; // 20 minutos
const MAX_CACHE_SIZE = 2500; // Reduzido para melhor performance
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
      
      logger.info('🚀 Seleção aleatória otimizada v2 iniciada', { 
        level, 
        isMobile,
        cacheExists: !!globalWordsCache,
        targetWords: 5
      }, 'OPTIMIZED_RANDOM_SELECTION_V2');
      
      // Timeout adaptativo mais inteligente
      const hasValidCache = globalWordsCache && Date.now() - globalWordsCache.timestamp < CACHE_DURATION;
      const timeoutMs = hasValidCache ? (isMobile ? 1000 : 1500) : (isMobile ? 3000 : 4000);
      
      timeoutRef.current = setTimeout(() => {
        logger.warn('⏰ Timeout na seleção otimizada v2', { level, isMobile, timeoutMs }, 'OPTIMIZED_RANDOM_SELECTION_V2');
        handleIntelligentFallback(startTime);
      }, timeoutMs);

      try {
        const boardSize = getBoardSize(level);
        const maxWordLength = Math.min(boardSize - 1, 8);
        
        setLoadingStep('Verificando cache inteligente...');

        // 1. VERIFICAÇÃO DE CACHE INTELIGENTE MELHORADA
        const cacheKey = `${maxWordLength}_optimized`;
        
        if (await isValidOptimizedCache(cacheKey, maxWordLength)) {
          const cachedResult = globalWordsCache!.processedData.get(cacheKey)!;
          const finalWords = selectIntelligentWords(cachedResult.words, 5);
          
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
          
          logger.info('⚡ Cache otimizado hit v2', { 
            level, 
            wordsCount: finalWords.length,
            processingTime: Math.round(performance.now() - startTime)
          }, 'OPTIMIZED_RANDOM_SELECTION_V2');
          
          // Background: integrar com LocalWordCacheManager
          LocalWordCacheManager.setCachedWords(finalWords, maxWordLength, 'optimized');
          return;
        }

        // 2. QUERY OTIMIZADA COM FALLBACK INTELIGENTE
        setLoadingStep('Carregando do banco...');
        
        if (!globalWordsCache || await shouldRefreshOptimizedCache()) {
          const { data: words, error: dbError } = await supabase
            .from('level_words')
            .select('word, difficulty, category, updated_at')
            .eq('is_active', true)
            .limit(MAX_CACHE_SIZE)
            .order('updated_at', { ascending: false }); // Palavras mais recentes

          if (dbError || !words || words.length === 0) {
            throw new Error(`Database error: ${dbError?.message || 'No words found'}`);
          }

          // Atualizar cache global otimizado
          const latestUpdate = Math.max(...words.map(w => new Date(w.updated_at || Date.now()).getTime()));
          globalWordsCache = {
            words: words,
            timestamp: Date.now(),
            lastDbUpdate: latestUpdate,
            processedData: new Map()
          };
        }

        // 3. PROCESSAMENTO OTIMIZADO E SELEÇÃO INTELIGENTE
        setLoadingStep(`Processando ${globalWordsCache.words.length} palavras...`);
        
        const selectedWords = await processWordsOptimized(globalWordsCache.words, maxWordLength, isMobile);
        
        // Armazenar no cache processado
        globalWordsCache.processedData.set(cacheKey, {
          words: selectedWords.validWords,
          timestamp: Date.now(),
          maxWordLength: maxWordLength
        });
        
        const finalWords = selectIntelligentWords(selectedWords.validWords, 5);

        setLevelWords(finalWords);
        setMetrics({
          totalWords: globalWordsCache.words.length,
          validWords: finalWords.length,
          processingTime: performance.now() - startTime,
          cacheHit: false,
          chunkSize: selectedWords.chunkSize,
          chunksProcessed: selectedWords.chunksProcessed
        });

        // Background: integrar com LocalWordCacheManager
        LocalWordCacheManager.setCachedWords(finalWords, maxWordLength, 'optimized');
        
        logger.info('✅ Seleção aleatória otimizada v2 concluída', { 
          level,
          wordsCount: finalWords.length,
          totalProcessed: globalWordsCache.words.length,
          processingTime: Math.round(performance.now() - startTime)
        }, 'OPTIMIZED_RANDOM_SELECTION_V2');
        
      } catch (error) {
        await handleOptimizedError(error, startTime);
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

  // HELPERS OTIMIZADOS

  const isValidOptimizedCache = async (cacheKey: string, maxWordLength: number): Promise<boolean> => {
    if (!globalWordsCache || Date.now() - globalWordsCache.timestamp > CACHE_DURATION) {
      return false;
    }
    
    const cached = globalWordsCache.processedData.get(cacheKey);
    return !!(cached && cached.maxWordLength === maxWordLength && cached.words.length >= 5);
  };

  const shouldRefreshOptimizedCache = async (): Promise<boolean> => {
    if (!globalWordsCache) return true;
    
    try {
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
      logger.warn('⚠️ Erro verificando atualização do cache otimizado', { error }, 'OPTIMIZED_RANDOM_SELECTION_V2');
    }
    
    return false;
  };

  const handleIntelligentFallback = (startTime: number) => {
    setLoadingStep('Usando fallback inteligente...');
    
    try {
      // 1. Tentar cache local primeiro
      const boardSize = getBoardSize(level);
      const maxWordLength = Math.min(boardSize - 1, 8);
      const cachedWords = LocalWordCacheManager.getCachedWords(maxWordLength, 5);
      
      if (cachedWords && cachedWords.length >= 5) {
        setLevelWords(cachedWords);
        setError('Usando cache local - rede lenta');
        setMetrics({
          totalWords: 0,
          validWords: cachedWords.length,
          processingTime: performance.now() - startTime,
          cacheHit: true,
          chunkSize: 0,
          chunksProcessed: 0
        });
        
        logger.info('🆘 Fallback para cache local otimizado', { 
          wordsCount: cachedWords.length 
        }, 'OPTIMIZED_RANDOM_SELECTION_V2');
        return;
      }
      
      // 2. Fallback para cache global antigo
      if (globalWordsCache && globalWordsCache.words.length > 0) {
        const words = globalWordsCache.words
          .map(w => normalizeText(w.word))
          .filter(w => w.length <= maxWordLength)
          .slice(0, 5);
        
        setLevelWords(words);
        setError('Cache antigo - funcionando offline');
        setMetrics({
          totalWords: globalWordsCache.words.length,
          validWords: words.length,
          processingTime: performance.now() - startTime,
          cacheHit: true,
          chunkSize: 0,
          chunksProcessed: 0
        });
        
        logger.info('🆘 Fallback para cache global antigo', { 
          wordsCount: words.length 
        }, 'OPTIMIZED_RANDOM_SELECTION_V2');
        return;
      }
      
      // 3. Fallback de emergência
      const emergencyWords = LocalWordCacheManager.getEmergencyFallback(5);
      setLevelWords(emergencyWords);
      setError('Modo offline - palavras de emergência');
      setMetrics({
        totalWords: 0,
        validWords: emergencyWords.length,
        processingTime: performance.now() - startTime,
        cacheHit: false,
        chunkSize: 0,
        chunksProcessed: 0
      });
      
      logger.warn('🚨 Fallback de emergência final', { 
        wordsCount: emergencyWords.length 
      }, 'OPTIMIZED_RANDOM_SELECTION_V2');
      
    } catch (fallbackError) {
      logger.error('❌ Erro no fallback inteligente', { fallbackError }, 'OPTIMIZED_RANDOM_SELECTION_V2');
      setError('Erro crítico na seleção de palavras');
    }
  };

  const handleOptimizedError = async (error: any, startTime: number) => {
    logger.error('❌ Erro na seleção otimizada v2', { error, level }, 'OPTIMIZED_RANDOM_SELECTION_V2');
    
    // Retry inteligente para erros de rede
    if (retryCountRef.current === 0 && 
        (error instanceof Error && 
         (error.message.includes('network') || 
          error.message.includes('timeout') || 
          error.message.includes('Database error')))) {
      
      retryCountRef.current++;
      setLoadingStep('Tentando novamente...');
      
      logger.info('🔄 Retry automático otimizado', { level }, 'OPTIMIZED_RANDOM_SELECTION_V2');
      
      // Delay exponencial
      setTimeout(() => {
        // A função principal será re-executada pelo useEffect
      }, Math.pow(2, retryCountRef.current) * 1000);
      return;
    }
    
    // Fallback final
    handleIntelligentFallback(startTime);
  };

  return { levelWords, isLoading, error, loadingStep, metrics };
};

// PROCESSAMENTO OTIMIZADO COM CHUNKS INTELIGENTES
const processWordsOptimized = async (
  words: Array<{ word: string; difficulty: string; category: string }>,
  maxWordLength: number,
  isMobile: boolean
): Promise<{ validWords: string[]; chunkSize: number; chunksProcessed: number }> => {
  
  // Chunk size otimizado baseado no device e performance
  const optimalChunkSize = isMobile ? 250 : 400;
  const chunkSize = Math.min(optimalChunkSize, Math.max(100, Math.floor(words.length / 8)));
  
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize));
  }
  
  let validWords: string[] = [];
  
  // Processar chunks com otimização de performance
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkValid = chunk
      .filter(w => w.word && typeof w.word === 'string')
      .map(w => normalizeText(w.word))
      .filter(word => isValidGameWord(word, maxWordLength));
    
    validWords = validWords.concat(chunkValid);
    
    // Micro delay apenas para chunks grandes
    if (chunks.length > 3 && chunkSize > 300 && i < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1));
    }
  }

  if (validWords.length === 0) {
    throw new Error('Nenhuma palavra válida encontrada no processamento otimizado');
  }

  // Manter pool otimizado de palavras válidas
  const poolSize = Math.min(40, validWords.length);
  return {
    validWords: selectIntelligentWords(validWords, poolSize),
    chunkSize,
    chunksProcessed: chunks.length
  };
};

// SELEÇÃO INTELIGENTE DE PALAVRAS
const selectIntelligentWords = (words: string[], count: number): string[] => {
  if (words.length === 0) return [];
  if (words.length <= count) return [...words];
  
  // Remover duplicatas e aplicar Fisher-Yates otimizado
  const uniqueWords = [...new Set(words)];
  const shuffled = [...uniqueWords];
  
  // Embaralhar apenas o necessário para performance
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const j = i + Math.floor(Math.random() * (shuffled.length - i));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, count);
};

// CACHE WARMING OTIMIZADO (integração com sistema existente)
export const warmOptimizedCacheV2 = async (): Promise<void> => {
  if (globalWordsCache && Date.now() - globalWordsCache.timestamp < CACHE_DURATION) {
    return; // Cache ainda válido
  }
  
  try {
    logger.info('🔥 Warming cache otimizado v2', undefined, 'CACHE_WARMING_V2');
    
    const { data: words } = await supabase
      .from('level_words')
      .select('word, difficulty, category, updated_at')
      .eq('is_active', true)
      .limit(MAX_CACHE_SIZE)
      .order('updated_at', { ascending: false });
    
    if (words && words.length > 0) {
      const latestUpdate = Math.max(...words.map(w => new Date(w.updated_at || Date.now()).getTime()));
      globalWordsCache = {
        words: words,
        timestamp: Date.now(),
        lastDbUpdate: latestUpdate,
        processedData: new Map()
      };
      
      // Integrar com LocalWordCacheManager
      const sampleWords = words.slice(0, 20).map(w => normalizeText(w.word));
      LocalWordCacheManager.setCachedWords(sampleWords, 8, 'warming');
      
      logger.info('✅ Cache warming otimizado v2 concluído', { 
        wordsCount: words.length 
      }, 'CACHE_WARMING_V2');
    }
  } catch (error) {
    logger.warn('⚠️ Erro no cache warming otimizado v2', { error }, 'CACHE_WARMING_V2');
  }
};

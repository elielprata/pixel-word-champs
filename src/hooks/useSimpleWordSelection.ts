
import { useState, useEffect, useRef } from 'react';
import { IntelligentWordService } from '@/services/intelligentWordService';
import { LocalWordCacheManager } from '@/utils/localWordCache';
import { getBoardSize } from '@/utils/boardUtils';
import { logger } from '@/utils/logger';
import { useIsMobile } from './use-mobile';
import { useLocalWordFallback } from './useLocalWordFallback';

interface SimpleWordSelectionResult {
  levelWords: string[];
  isLoading: boolean;
  error: string | null;
  source: 'database' | 'cache' | 'default' | 'emergency' | 'fallback';
  processingTime: number;
  metrics: {
    attempts: number;
    fallbacksUsed: string[];
    cacheHit: boolean;
    performance: number;
  };
}

export const useSimpleWordSelection = (level: number): SimpleWordSelectionResult => {
  const [levelWords, setLevelWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'database' | 'cache' | 'default' | 'emergency' | 'fallback'>('database');
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [metrics, setMetrics] = useState({
    attempts: 0,
    fallbacksUsed: [] as string[],
    cacheHit: false,
    performance: 0
  });
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const attemptsRef = useRef(0);
  const fallbacksRef = useRef<string[]>([]);
  const isMobile = useIsMobile();

  // Hook de fallback local
  const { fallbackWords, fallbackSource } = useLocalWordFallback(level);

  useEffect(() => {
    const selectWordsIntelligently = async () => {
      const startTime = performance.now();
      setIsLoading(true);
      setError(null);
      attemptsRef.current = 0;
      fallbacksRef.current = [];
      
      logger.info('🎲 Seleção inteligente otimizada iniciada', { 
        level, 
        isMobile,
        fallbackAvailable: fallbackWords.length
      }, 'SIMPLE_WORD_SELECTION');
      
      // Timeout adaptativo mais inteligente baseado em múltiplos fatores
      const baseTimeout = isMobile ? 2000 : 3000;
      const cacheBonus = LocalWordCacheManager.getCacheStats().totalWords > 50 ? 500 : 0;
      const timeoutMs = baseTimeout - cacheBonus;
      
      timeoutRef.current = setTimeout(() => {
        attemptsRef.current++;
        fallbacksRef.current.push('timeout');
        
        logger.warn('⏰ Timeout na seleção - usando fallback inteligente', { 
          level, 
          timeoutMs,
          attempts: attemptsRef.current
        }, 'SIMPLE_WORD_SELECTION');
        
        handleTimeoutFallback(startTime);
      }, timeoutMs);

      try {
        attemptsRef.current++;
        const boardSize = getBoardSize(level);
        const maxWordLength = Math.min(boardSize - 1, 8);
        
        logger.info('📏 Configuração otimizada avançada', { 
          level, 
          boardSize, 
          maxWordLength,
          isMobile,
          timeoutMs
        }, 'SIMPLE_WORD_SELECTION');
        
        // Usar serviço inteligente com métricas melhoradas
        const result = await IntelligentWordService.getWordsWithIntelligentFallback(
          5, 
          maxWordLength, 
          level
        );
        
        if (result.words.length === 0) {
          throw new Error('Nenhuma palavra retornada pelo serviço inteligente');
        }

        setLevelWords(result.words);
        setSource(result.source);
        setProcessingTime(result.processingTime);
        
        // Métricas avançadas
        const finalMetrics = {
          attempts: attemptsRef.current,
          fallbacksUsed: fallbacksRef.current,
          cacheHit: result.source === 'cache',
          performance: Math.round(result.processingTime)
        };
        setMetrics(finalMetrics);
        
        logger.info('✅ Seleção inteligente otimizada concluída', { 
          level,
          wordsCount: result.words.length,
          source: result.source,
          processingTime: Math.round(result.processingTime),
          metrics: finalMetrics,
          words: result.words 
        }, 'SIMPLE_WORD_SELECTION');
        
      } catch (error) {
        attemptsRef.current++;
        fallbacksRef.current.push('error');
        
        logger.error('❌ Erro na seleção inteligente', { 
          error, 
          level,
          attempts: attemptsRef.current
        }, 'SIMPLE_WORD_SELECTION');
        
        handleErrorFallback(error, startTime);
      } finally {
        setIsLoading(false);
        clearTimeout(timeoutRef.current);
      }
    };

    // Função de fallback para timeout
    const handleTimeoutFallback = (startTime: number) => {
      if (fallbackWords.length >= 5) {
        setLevelWords(fallbackWords);
        setSource('fallback');
        setError(`Timeout (${Math.round(performance.now() - startTime)}ms) - usando fallback local`);
        
        logger.info('🆘 Timeout - usando fallback local', { 
          words: fallbackWords,
          fallbackSource 
        }, 'SIMPLE_WORD_SELECTION');
      } else {
        // Fallback de emergência absoluto
        const emergencyWords = LocalWordCacheManager.getEmergencyFallback(5);
        setLevelWords(emergencyWords);
        setSource('emergency');
        setError(`Timeout - usando fallback de emergência`);
        
        logger.warn('🚨 Timeout - fallback de emergência final', { 
          words: emergencyWords 
        }, 'SIMPLE_WORD_SELECTION');
      }
      
      setProcessingTime(performance.now() - startTime);
      setMetrics({
        attempts: attemptsRef.current,
        fallbacksUsed: fallbacksRef.current,
        cacheHit: false,
        performance: Math.round(performance.now() - startTime)
      });
      setIsLoading(false);
    };

    // Função de fallback para erro
    const handleErrorFallback = (error: any, startTime: number) => {
      if (fallbackWords.length >= 5) {
        setLevelWords(fallbackWords);
        setSource('fallback');
        setError(`Erro: ${error instanceof Error ? error.message : 'Desconhecido'} - usando fallback local`);
        
        logger.info('🆘 Erro - usando fallback local', { 
          words: fallbackWords,
          fallbackSource 
        }, 'SIMPLE_WORD_SELECTION');
      } else {
        // Último recurso - fallback de emergência
        const emergencyWords = LocalWordCacheManager.getEmergencyFallback(5);
        setLevelWords(emergencyWords);
        setSource('emergency');
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        
        logger.warn('🚨 Erro - fallback de emergência final', { 
          words: emergencyWords 
        }, 'SIMPLE_WORD_SELECTION');
      }
      
      setProcessingTime(performance.now() - startTime);
      setMetrics({
        attempts: attemptsRef.current,
        fallbacksUsed: fallbacksRef.current,
        cacheHit: false,
        performance: Math.round(performance.now() - startTime)
      });
    };

    selectWordsIntelligently();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [level, isMobile, fallbackWords, fallbackSource]);

  return { 
    levelWords, 
    isLoading, 
    error, 
    source, 
    processingTime,
    metrics
  };
};

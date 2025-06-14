
import { useRef } from 'react';
import { IntelligentWordService } from '@/services/intelligentWordService';
import { LocalWordCacheManager } from '@/utils/localWordCache';
import { getBoardSize } from '@/utils/boardUtils';
import { logger } from '@/utils/logger';

interface SimpleWordSelectionLogicProps {
  setLevelWords: (words: string[]) => void;
  setSource: (source: 'database' | 'cache' | 'default' | 'emergency' | 'fallback') => void;
  setProcessingTime: (time: number) => void;
  setMetrics: (metrics: any) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  timeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>;
  level: number;
  isMobile: boolean;
  fallbackWords: string[];
  fallbackSource: string;
}

export const useSimpleWordSelectionLogic = ({
  setLevelWords,
  setSource,
  setProcessingTime,
  setMetrics,
  setIsLoading,
  setError,
  timeoutRef,
  level,
  isMobile,
  fallbackWords,
  fallbackSource
}: SimpleWordSelectionLogicProps) => {
  const attemptsRef = useRef(0);
  const fallbacksRef = useRef<string[]>([]);

  const selectWordsIntelligently = async () => {
    const startTime = performance.now();
    setIsLoading(true);
    setError(null);
    attemptsRef.current = 0;
    fallbacksRef.current = [];
    
    logger.info('🎲 Seleção simples otimizada v2 iniciada', { 
      level, 
      isMobile,
      fallbackAvailable: fallbackWords.length
    }, 'SIMPLE_WORD_SELECTION_V2');
    
    // Timeout adaptativo inteligente baseado na saúde do cache
    const cacheStats = LocalWordCacheManager.getDetailedMetrics();
    const cacheHealth = cacheStats.health;
    
    const baseTimeout = isMobile ? 1800 : 2500;
    const healthBonus = cacheHealth === 'excellent' ? 500 : 
                       cacheHealth === 'good' ? 300 : 0;
    const timeoutMs = baseTimeout - healthBonus;
    
    timeoutRef.current = setTimeout(() => {
      attemptsRef.current++;
      fallbacksRef.current.push('timeout');
      
      logger.warn('⏰ Timeout na seleção otimizada v2', { 
        level, 
        timeoutMs,
        cacheHealth,
        attempts: attemptsRef.current
      }, 'SIMPLE_WORD_SELECTION_V2');
      
      handleOptimizedTimeoutFallback(startTime, cacheHealth);
    }, timeoutMs);

    try {
      attemptsRef.current++;
      const boardSize = getBoardSize(level);
      const maxWordLength = Math.min(boardSize - 1, 8);
      
      logger.info('📏 Configuração otimizada v2', { 
        level, 
        boardSize, 
        maxWordLength,
        isMobile,
        timeoutMs,
        cacheHealth
      }, 'SIMPLE_WORD_SELECTION_V2');
      
      // Usar serviço inteligente com métricas otimizadas
      const result = await IntelligentWordService.getWordsWithIntelligentFallback(
        5, 
        maxWordLength, 
        level
      );
      
      if (result.words.length === 0) {
        throw new Error('Nenhuma palavra retornada pelo serviço inteligente otimizado');
      }

      setLevelWords(result.words);
      setSource(result.source);
      setProcessingTime(result.processingTime);
      
      // Métricas otimizadas com saúde do cache
      const finalMetrics = {
        attempts: attemptsRef.current,
        fallbacksUsed: fallbacksRef.current,
        cacheHit: result.source === 'cache',
        performance: Math.round(result.processingTime),
        cacheHealth: cacheHealth
      };
      setMetrics(finalMetrics);
      
      logger.info('✅ Seleção simples otimizada v2 concluída', { 
        level,
        wordsCount: result.words.length,
        source: result.source,
        processingTime: Math.round(result.processingTime),
        metrics: finalMetrics,
        cacheHealth
      }, 'SIMPLE_WORD_SELECTION_V2');
      
    } catch (error) {
      attemptsRef.current++;
      fallbacksRef.current.push('error');
      
      logger.error('❌ Erro na seleção simples otimizada v2', { 
        error, 
        level,
        attempts: attemptsRef.current,
        cacheHealth
      }, 'SIMPLE_WORD_SELECTION_V2');
      
      handleOptimizedErrorFallback(error, startTime, cacheHealth);
    } finally {
      setIsLoading(false);
      clearTimeout(timeoutRef.current);
    }
  };

  const handleOptimizedTimeoutFallback = (startTime: number, cacheHealth: string) => {
    if (fallbackWords.length >= 5) {
      setLevelWords(fallbackWords);
      setSource('fallback');
      setError(`Timeout (${Math.round(performance.now() - startTime)}ms) - usando fallback otimizado`);
      
      logger.info('🆘 Timeout - usando fallback local otimizado', { 
        words: fallbackWords,
        fallbackSource,
        cacheHealth
      }, 'SIMPLE_WORD_SELECTION_V2');
    } else {
      // Fallback de emergência otimizado
      const emergencyWords = LocalWordCacheManager.getEmergencyFallback(5);
      setLevelWords(emergencyWords);
      setSource('emergency');
      setError(`Timeout - usando fallback de emergência otimizado`);
      
      logger.warn('🚨 Timeout - fallback de emergência otimizado', { 
        words: emergencyWords,
        cacheHealth
      }, 'SIMPLE_WORD_SELECTION_V2');
    }
    
    setProcessingTime(performance.now() - startTime);
    setMetrics({
      attempts: attemptsRef.current,
      fallbacksUsed: fallbacksRef.current,
      cacheHit: false,
      performance: Math.round(performance.now() - startTime),
      cacheHealth
    });
    setIsLoading(false);
  };

  const handleOptimizedErrorFallback = (error: any, startTime: number, cacheHealth: string) => {
    if (fallbackWords.length >= 5) {
      setLevelWords(fallbackWords);
      setSource('fallback');
      setError(`Erro: ${error instanceof Error ? error.message : 'Desconhecido'} - usando fallback otimizado`);
      
      logger.info('🆘 Erro - usando fallback local otimizado', { 
        words: fallbackWords,
        fallbackSource,
        cacheHealth
      }, 'SIMPLE_WORD_SELECTION_V2');
    } else {
      // Último recurso - fallback de emergência otimizado
      const emergencyWords = LocalWordCacheManager.getEmergencyFallback(5);
      setLevelWords(emergencyWords);
      setSource('emergency');
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      
      logger.warn('🚨 Erro - fallback de emergência otimizado', { 
        words: emergencyWords,
        cacheHealth
      }, 'SIMPLE_WORD_SELECTION_V2');
    }
    
    setProcessingTime(performance.now() - startTime);
    setMetrics({
      attempts: attemptsRef.current,
      fallbacksUsed: fallbacksRef.current,
      cacheHit: false,
      performance: Math.round(performance.now() - startTime),
      cacheHealth
    });
  };

  return {
    selectWordsIntelligently,
    handleOptimizedTimeoutFallback,
    handleOptimizedErrorFallback
  };
};

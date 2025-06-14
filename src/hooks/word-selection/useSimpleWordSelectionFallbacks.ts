
import { LocalWordCacheManager } from '@/utils/localWordCache';
import { logger } from '@/utils/logger';

interface SimpleWordSelectionFallbacksProps {
  setLevelWords: (words: string[]) => void;
  setSource: (source: 'database' | 'cache' | 'default' | 'emergency' | 'fallback') => void;
  setError: (error: string | null) => void;
  setProcessingTime: (time: number) => void;
  setMetrics: (metrics: any) => void;
  setIsLoading: (loading: boolean) => void;
  fallbackWords: string[];
  fallbackSource: string;
}

export const useSimpleWordSelectionFallbacks = ({
  setLevelWords,
  setSource,
  setError,
  setProcessingTime,
  setMetrics,
  setIsLoading,
  fallbackWords,
  fallbackSource
}: SimpleWordSelectionFallbacksProps) => {

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
      attempts: 1,
      fallbacksUsed: ['timeout'],
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
      attempts: 1,
      fallbacksUsed: ['error'],
      cacheHit: false,
      performance: Math.round(performance.now() - startTime),
      cacheHealth
    });
  };

  return {
    handleOptimizedTimeoutFallback,
    handleOptimizedErrorFallback
  };
};

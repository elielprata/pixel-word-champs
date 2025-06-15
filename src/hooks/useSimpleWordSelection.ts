
import { useState, useEffect, useRef } from 'react';
import { IntelligentWordService } from '@/services/intelligentWordService';
import { LocalWordCacheManager } from '@/utils/localWordCache';
import { getBoardSize } from '@/utils/boardUtils';
import { logger } from '@/utils/logger';
import { useIsMobile } from './use-mobile';
import { useLocalWordFallback } from './useLocalWordFallback';
import { useSimpleWordSelectionLogic } from './word-selection/useSimpleWordSelectionLogic';
import { useSimpleWordSelectionFallbacks } from './word-selection/useSimpleWordSelectionFallbacks';

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
    cacheHealth: string;
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
    performance: 0,
    cacheHealth: 'unknown'
  });
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isMobile = useIsMobile();
  const { fallbackWords, fallbackSource } = useLocalWordFallback(level);
  
  const { selectWordsIntelligently } = useSimpleWordSelectionLogic({
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
  });

  const { handleOptimizedTimeoutFallback, handleOptimizedErrorFallback } = useSimpleWordSelectionFallbacks({
    setLevelWords,
    setSource,
    setError,
    setProcessingTime,
    setMetrics,
    setIsLoading,
    fallbackWords,
    fallbackSource
  });

  useEffect(() => {
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

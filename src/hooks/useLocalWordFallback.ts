
import { useState, useEffect } from 'react';
import { LocalWordCacheManager } from '@/utils/localWordCache';
import { getBoardSize } from '@/utils/boardUtils';
import { logger } from '@/utils/logger';

interface LocalFallbackResult {
  fallbackWords: string[];
  fallbackSource: 'cache' | 'emergency';
}

export const useLocalWordFallback = (level: number): LocalFallbackResult => {
  const [fallbackWords, setFallbackWords] = useState<string[]>([]);
  const [fallbackSource, setFallbackSource] = useState<'cache' | 'emergency'>('emergency');

  useEffect(() => {
    const boardSize = getBoardSize(level);
    const maxWordLength = Math.min(boardSize - 1, 8);

    // Tentar cache primeiro
    const cachedWords = LocalWordCacheManager.getCachedWords(maxWordLength, 5);
    
    if (cachedWords) {
      setFallbackWords(cachedWords);
      setFallbackSource('cache');
      
      logger.info('✅ Fallback usando cache', { 
        wordsCount: cachedWords.length 
      }, 'LOCAL_FALLBACK');
    } else {
      // Usar palavras de emergência
      const emergencyWords = LocalWordCacheManager.getEmergencyFallback(5);
      setFallbackWords(emergencyWords);
      setFallbackSource('emergency');
      
      logger.info('🆘 Fallback de emergência', { 
        wordsCount: emergencyWords.length 
      }, 'LOCAL_FALLBACK');
    }
  }, [level]);

  return {
    fallbackWords,
    fallbackSource
  };
};

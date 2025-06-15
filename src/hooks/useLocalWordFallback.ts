
import { useState, useEffect, useRef } from 'react';
import { LocalWordCacheManager } from '@/utils/localWordCache';
import { getBoardSize } from '@/utils/boardUtils';
import { logger } from '@/utils/logger';
import { useIsMobile } from './use-mobile';

interface LocalFallbackResult {
  fallbackWords: string[];
  fallbackSource: 'cache' | 'emergency';
}

export const useLocalWordFallback = (level: number): LocalFallbackResult => {
  const [fallbackWords, setFallbackWords] = useState<string[]>([]);
  const [fallbackSource, setFallbackSource] = useState<'cache' | 'emergency'>('cache');
  const isMobile = useIsMobile();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initializeFallback = () => {
      logger.info('🔄 Inicializando fallback local simples', { level, isMobile }, 'LOCAL_FALLBACK');

      const boardSize = getBoardSize(level);
      const maxWordLength = Math.min(boardSize - 1, 8);

      // Tentar cache local primeiro
      const cachedWords = LocalWordCacheManager.getCachedWords(maxWordLength, 5);
      
      if (cachedWords && cachedWords.length >= 5) {
        setFallbackWords(cachedWords);
        setFallbackSource('cache');
        
        logger.info('✅ Fallback usando cache local', { 
          wordsCount: cachedWords.length,
          maxWordLength 
        }, 'LOCAL_FALLBACK');
      } else {
        // Fallback de emergência
        const emergencyWords = LocalWordCacheManager.getEmergencyFallback(5);
        setFallbackWords(emergencyWords);
        setFallbackSource('emergency');
        
        logger.info('🆘 Fallback de emergência', { 
          wordsCount: emergencyWords.length 
        }, 'LOCAL_FALLBACK');
      }
    };

    initializeFallback();
  }, [level, isMobile]);

  return {
    fallbackWords,
    fallbackSource
  };
};

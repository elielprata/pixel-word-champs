
import { useState, useEffect, useRef } from 'react';
import { LocalWordCacheManager } from '@/utils/localWordCache';
import { getBoardSize } from '@/utils/boardUtils';
import { getDefaultWordsForSize } from '@/utils/levelConfiguration';
import { logger } from '@/utils/logger';
import { useIsMobile } from './use-mobile';

interface LocalFallbackResult {
  fallbackWords: string[];
  cacheStats: {
    totalEntries: number;
    totalWords: number;
    cacheAge: number;
  };
  fallbackSource: 'cache' | 'default' | 'emergency';
}

export const useLocalWordFallback = (level: number): LocalFallbackResult => {
  const [fallbackWords, setFallbackWords] = useState<string[]>([]);
  const [cacheStats, setCacheStats] = useState({
    totalEntries: 0,
    totalWords: 0,
    cacheAge: 0
  });
  const [fallbackSource, setFallbackSource] = useState<'cache' | 'default' | 'emergency'>('cache');
  const isMobile = useIsMobile();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initializeFallback = () => {
      logger.info('🔄 Inicializando sistema de fallback local', { 
        level, 
        isMobile 
      }, 'LOCAL_FALLBACK');

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
        // Fallback para palavras padrão
        try {
          const defaultWords = getDefaultWordsForSize(boardSize);
          if (defaultWords && defaultWords.length > 0) {
            setFallbackWords(defaultWords);
            setFallbackSource('default');
            
            logger.info('🔄 Fallback usando palavras padrão', { 
              wordsCount: defaultWords.length 
            }, 'LOCAL_FALLBACK');
          } else {
            throw new Error('Palavras padrão não disponíveis');
          }
        } catch (error) {
          // Fallback de emergência
          const emergencyWords = LocalWordCacheManager.getEmergencyFallback(5);
          setFallbackWords(emergencyWords);
          setFallbackSource('emergency');
          
          logger.warn('🆘 Fallback de emergência ativado', { 
            error,
            wordsCount: emergencyWords.length 
          }, 'LOCAL_FALLBACK');
        }
      }

      // Atualizar estatísticas do cache
      const stats = LocalWordCacheManager.getCacheStats();
      const cacheAge = stats.newestEntry > 0 ? 
        Math.round((Date.now() - stats.newestEntry) / (1000 * 60)) : 0;
      
      setCacheStats({
        totalEntries: stats.totalEntries,
        totalWords: stats.totalWords,
        cacheAge
      });

      logger.info('📊 Estatísticas do cache local', { 
        ...stats,
        cacheAge 
      }, 'LOCAL_FALLBACK');
    };

    initializeFallback();
  }, [level, isMobile]);

  return {
    fallbackWords,
    cacheStats,
    fallbackSource
  };
};

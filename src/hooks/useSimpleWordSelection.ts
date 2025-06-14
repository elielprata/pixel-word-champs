
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
}

export const useSimpleWordSelection = (level: number): SimpleWordSelectionResult => {
  const [levelWords, setLevelWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'database' | 'cache' | 'default' | 'emergency' | 'fallback'>('database');
  const [processingTime, setProcessingTime] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isMobile = useIsMobile();

  // Hook de fallback local
  const { fallbackWords, fallbackSource } = useLocalWordFallback(level);

  useEffect(() => {
    const selectWordsIntelligently = async () => {
      const startTime = performance.now();
      setIsLoading(true);
      setError(null);
      
      logger.info('🎲 Seleção inteligente iniciada', { 
        level, 
        isMobile,
        fallbackAvailable: fallbackWords.length
      }, 'SIMPLE_WORD_SELECTION');
      
      // Timeout adaptativo mais agressivo
      const timeoutMs = isMobile ? 2500 : 3500;
      timeoutRef.current = setTimeout(() => {
        logger.warn('⏰ Timeout na seleção - usando fallback local', { 
          level, 
          timeoutMs 
        }, 'SIMPLE_WORD_SELECTION');
        
        // Usar fallback local imediatamente
        if (fallbackWords.length >= 5) {
          setLevelWords(fallbackWords);
          setSource('fallback');
          setError(`Timeout (${timeoutMs}ms) - usando fallback local`);
        } else {
          // Fallback de emergência absoluto
          const emergencyWords = LocalWordCacheManager.getEmergencyFallback(5);
          setLevelWords(emergencyWords);
          setSource('emergency');
          setError(`Timeout - usando fallback de emergência`);
        }
        
        setProcessingTime(performance.now() - startTime);
        setIsLoading(false);
      }, timeoutMs);

      try {
        const boardSize = getBoardSize(level);
        const maxWordLength = Math.min(boardSize - 1, 8);
        
        logger.info('📏 Configuração inteligente', { 
          level, 
          boardSize, 
          maxWordLength,
          isMobile 
        }, 'SIMPLE_WORD_SELECTION');
        
        // Usar serviço inteligente com múltiplos fallbacks
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
        
        logger.info('✅ Seleção inteligente concluída', { 
          level,
          wordsCount: result.words.length,
          source: result.source,
          processingTime: Math.round(result.processingTime),
          words: result.words 
        }, 'SIMPLE_WORD_SELECTION');
        
      } catch (error) {
        logger.error('❌ Erro na seleção inteligente', { 
          error, 
          level 
        }, 'SIMPLE_WORD_SELECTION');
        
        // Fallback para sistema local
        if (fallbackWords.length >= 5) {
          setLevelWords(fallbackWords);
          setSource('fallback');
          setError(`Erro: ${error instanceof Error ? error.message : 'Desconhecido'} - usando fallback local`);
          
          logger.info('🆘 Usando fallback local após erro', { 
            words: fallbackWords,
            fallbackSource 
          }, 'SIMPLE_WORD_SELECTION');
        } else {
          // Último recurso - fallback de emergência
          const emergencyWords = LocalWordCacheManager.getEmergencyFallback(5);
          setLevelWords(emergencyWords);
          setSource('emergency');
          setError(error instanceof Error ? error.message : 'Erro desconhecido');
          
          logger.warn('🚨 Fallback de emergência final', { 
            words: emergencyWords 
          }, 'SIMPLE_WORD_SELECTION');
        }
        
        setProcessingTime(performance.now() - startTime);
      } finally {
        setIsLoading(false);
        clearTimeout(timeoutRef.current);
      }
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
    processingTime 
  };
};


import { useState, useEffect, useRef } from 'react';
import { SimpleWordService } from '@/services/simpleWordService';
import { getBoardSize } from '@/utils/boardUtils';
import { getDefaultWordsForSize } from '@/utils/levelConfiguration';
import { logger } from '@/utils/logger';
import { useIsMobile } from './use-mobile';

interface SimpleWordSelectionResult {
  levelWords: string[];
  isLoading: boolean;
  error: string | null;
}

export const useSimpleWordSelection = (level: number): SimpleWordSelectionResult => {
  const [levelWords, setLevelWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isMobile = useIsMobile();

  useEffect(() => {
    const selectRandomWords = async () => {
      setIsLoading(true);
      setError(null);
      
      logger.info('🎲 Iniciando seleção aleatória simples', { 
        level, 
        isMobile 
      }, 'SIMPLE_WORD_SELECTION');
      
      // Timeout de segurança
      const timeoutMs = isMobile ? 3000 : 4000;
      timeoutRef.current = setTimeout(() => {
        logger.warn('⏰ Timeout na seleção simples - usando fallback', { 
          level, 
          timeoutMs 
        }, 'SIMPLE_WORD_SELECTION');
        
        const fallbackWords = getDefaultWordsForSize(getBoardSize(level));
        setLevelWords(fallbackWords);
        setError('Timeout - usando palavras padrão');
        setIsLoading(false);
      }, timeoutMs);

      try {
        const boardSize = getBoardSize(level);
        const maxWordLength = Math.min(boardSize - 1, 8);
        
        // Usar serviço simples para seleção aleatória
        const selectedWords = await SimpleWordService.getRandomWordsForToday(5, maxWordLength);
        
        if (selectedWords.length === 0) {
          throw new Error('Nenhuma palavra retornada pelo serviço');
        }

        setLevelWords(selectedWords);
        
        // Registrar uso em background
        SimpleWordService.recordWordsUsage(selectedWords).catch(err => {
          logger.warn('Erro ao registrar uso (background)', { err }, 'SIMPLE_WORD_SELECTION');
        });
        
        logger.info('✅ Seleção aleatória simples concluída', { 
          level,
          wordsCount: selectedWords.length,
          words: selectedWords 
        }, 'SIMPLE_WORD_SELECTION');
        
      } catch (error) {
        logger.error('❌ Erro na seleção aleatória simples', { 
          error, 
          level 
        }, 'SIMPLE_WORD_SELECTION');
        
        // Fallback para palavras padrão
        const fallbackWords = getDefaultWordsForSize(getBoardSize(level));
        setLevelWords(fallbackWords);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        
        logger.info('🆘 Usando fallback simples', { 
          words: fallbackWords 
        }, 'SIMPLE_WORD_SELECTION');
      } finally {
        setIsLoading(false);
        clearTimeout(timeoutRef.current);
      }
    };

    selectRandomWords();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [level, isMobile]);

  return { levelWords, isLoading, error };
};

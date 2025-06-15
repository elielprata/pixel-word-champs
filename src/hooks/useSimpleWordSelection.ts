
import { useState, useEffect } from 'react';
import { SimpleWordService } from '@/services/simpleWordService';
import { logger } from '@/utils/logger';

interface SimpleWordSelectionResult {
  levelWords: string[];
  isLoading: boolean;
  error: string | null;
  source: 'database' | 'error';
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
  const [processingTime, setProcessingTime] = useState<number>(0);

  useEffect(() => {
    const selectWords = async () => {
      const startTime = Date.now();
      setIsLoading(true);
      setError(null);

      logger.info('🎯 Iniciando seleção simples de palavras', { level }, 'SIMPLE_WORD_SELECTION');

      try {
        // Usar apenas SimpleWordService - sem fallbacks
        const words = await SimpleWordService.getRandomWordsForToday(5, 8);
        
        if (!words || words.length === 0) {
          throw new Error('Nenhuma palavra foi retornada pelo serviço');
        }

        if (words.length !== 5) {
          throw new Error(`Número incorreto de palavras retornadas: ${words.length} (esperado: 5)`);
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        setLevelWords(words);
        setProcessingTime(duration);
        setIsLoading(false);

        // Registrar uso das palavras
        await SimpleWordService.recordWordsUsage(words);

        logger.info('✅ Palavras selecionadas com sucesso', {
          level,
          wordsCount: words.length,
          words,
          processingTime: duration
        }, 'SIMPLE_WORD_SELECTION');

      } catch (err) {
        const endTime = Date.now();
        const duration = endTime - startTime;

        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido na seleção de palavras';
        
        logger.error('❌ Erro crítico na seleção de palavras', {
          level,
          error: errorMessage,
          processingTime: duration
        }, 'SIMPLE_WORD_SELECTION');

        setError(`Falha ao carregar palavras: ${errorMessage}`);
        setProcessingTime(duration);
        setIsLoading(false);
        setLevelWords([]);
      }
    };

    selectWords();
  }, [level]);

  return {
    levelWords,
    isLoading,
    error,
    source: error ? 'error' : 'database',
    processingTime,
    metrics: {
      attempts: 1,
      fallbacksUsed: [], // Sem fallbacks conforme solicitado
      cacheHit: false,
      performance: processingTime,
      cacheHealth: 'unknown'
    }
  };
};

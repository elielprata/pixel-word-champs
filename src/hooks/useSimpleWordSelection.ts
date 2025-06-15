
import { useState, useEffect } from 'react';
import { SimpleWordService } from '@/services/simpleWordService';
import { getBoardSize } from '@/utils/boardUtils';
import { logger } from '@/utils/logger';

interface SimpleWordSelectionResult {
  levelWords: string[];
  isLoading: boolean;
  error: string | null;
  source: 'database' | 'emergency';
}

export const useSimpleWordSelection = (level: number): SimpleWordSelectionResult => {
  const [levelWords, setLevelWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'database' | 'emergency'>('database');

  useEffect(() => {
    const selectWords = async () => {
      setIsLoading(true);
      setError(null);
      
      logger.info('🎲 Iniciando seleção simples de palavras', { level }, 'SIMPLE_WORD_SELECTION');
      
      try {
        const boardSize = getBoardSize(level);
        const maxWordLength = Math.min(boardSize - 1, 8);
        
        // Sempre solicitar exatamente 5 palavras
        const words = await SimpleWordService.getRandomWordsForToday(5, maxWordLength);
        
        // Verificar se conseguimos palavras válidas
        if (words.length === 5) {
          setLevelWords(words);
          setSource('database');
          
          // Registrar uso das palavras
          await SimpleWordService.recordWordsUsage(words);
          
          logger.info('✅ Seleção simples concluída', { 
            wordsCount: words.length,
            level,
            words 
          }, 'SIMPLE_WORD_SELECTION');
        } else {
          throw new Error(`Retornadas ${words.length} palavras, esperado 5`);
        }

      } catch (error) {
        logger.error('❌ Erro na seleção simples - usando emergência', { error, level }, 'SIMPLE_WORD_SELECTION');
        
        // Fallback direto para palavras de emergência
        const emergencyWords = ['CASA', 'AMOR', 'VIDA', 'TEMPO', 'MUNDO'];
        setLevelWords(emergencyWords);
        setSource('emergency');
        setError('Usando palavras offline');
      } finally {
        setIsLoading(false);
      }
    };

    selectWords();
  }, [level]);

  return { levelWords, isLoading, error, source };
};

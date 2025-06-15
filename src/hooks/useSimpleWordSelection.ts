
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

// Palavras de emergência otimizadas
const EMERGENCY_WORDS = ['CASA', 'AMOR', 'VIDA', 'TEMPO', 'MUNDO'];

export const useSimpleWordSelection = (level: number): SimpleWordSelectionResult => {
  const [levelWords, setLevelWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'database' | 'emergency'>('database');

  useEffect(() => {
    const selectWords = async () => {
      setIsLoading(true);
      setError(null);
      
      logger.info('🎲 Iniciando seleção simplificada', { level }, 'SIMPLE_WORD_SELECTION');
      
      try {
        const boardSize = getBoardSize(level);
        const maxWordLength = Math.min(boardSize - 1, 8);
        
        // Usar serviço simplificado
        const words = await SimpleWordService.getRandomWordsForToday(5, maxWordLength);
        
        if (words.length >= 5) {
          setLevelWords(words);
          setSource('database');
          
          // Registrar uso das palavras
          await SimpleWordService.recordWordsUsage(words);
          
          logger.info('✅ Palavras selecionadas com sucesso', { 
            wordsCount: words.length,
            level,
            words 
          }, 'SIMPLE_WORD_SELECTION');
        } else {
          throw new Error('Poucas palavras válidas encontradas');
        }

      } catch (error) {
        logger.error('❌ Erro na seleção - usando emergência', { error, level }, 'SIMPLE_WORD_SELECTION');
        
        setLevelWords(EMERGENCY_WORDS);
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


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getBoardSize } from '@/utils/boardUtils';
import { normalizeText, isValidGameWord } from '@/utils/levelConfiguration';
import { logger } from '@/utils/logger';

interface SimpleWordSelectionResult {
  levelWords: string[];
  isLoading: boolean;
  error: string | null;
  source: 'database' | 'emergency';
}

// Palavras de emergência simples
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
      
      logger.info('🎲 Seleção simples iniciada', { level }, 'SIMPLE_WORD_SELECTION');
      
      try {
        const boardSize = getBoardSize(level);
        const maxWordLength = Math.min(boardSize - 1, 8);
        
        // Tentar buscar do banco de dados
        const { data: words, error: dbError } = await supabase
          .from('level_words')
          .select('word')
          .eq('is_active', true)
          .limit(50);

        if (dbError || !words || words.length === 0) {
          throw new Error('Falha ao carregar palavras do banco de dados');
        }

        // Processar palavras válidas
        const validWords = words
          .map(w => normalizeText(w.word))
          .filter(word => isValidGameWord(word, maxWordLength))
          .filter(word => word.length >= 3);

        if (validWords.length < 5) {
          throw new Error('Poucas palavras válidas encontradas');
        }

        // Selecionar 5 palavras aleatórias
        const shuffled = validWords.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 5);

        setLevelWords(selected);
        setSource('database');
        
        logger.info('✅ Palavras selecionadas do banco', { 
          wordsCount: selected.length,
          level
        }, 'SIMPLE_WORD_SELECTION');

      } catch (error) {
        logger.error('❌ Erro na seleção - usando emergência', { error, level }, 'SIMPLE_WORD_SELECTION');
        
        // Fallback para palavras de emergência
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

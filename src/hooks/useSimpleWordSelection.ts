
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getBoardSize } from '@/utils/boardUtils';
import { normalizeText, isValidGameWord } from '@/utils/levelConfiguration';
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
      const timeoutMs = 5000;
      timeoutRef.current = setTimeout(() => {
        logger.warn('⏰ Timeout na seleção - usando fallback', { level }, 'SIMPLE_WORD_SELECTION');
        setError('Timeout na seleção de palavras');
        setIsLoading(false);
      }, timeoutMs);

      try {
        const boardSize = getBoardSize(level);
        const maxWordLength = Math.min(boardSize - 1, 8);
        
        // Buscar todas as palavras ativas
        const { data: allWords, error: dbError } = await supabase
          .from('level_words')
          .select('word')
          .eq('is_active', true);

        if (dbError) {
          throw new Error(`Erro ao buscar palavras: ${dbError.message}`);
        }

        if (!allWords || allWords.length === 0) {
          throw new Error('Nenhuma palavra encontrada no banco');
        }

        // Filtrar palavras válidas
        const validWords = allWords
          .filter(w => w.word && typeof w.word === 'string')
          .map(w => normalizeText(w.word))
          .filter(word => isValidGameWord(word, maxWordLength));

        if (validWords.length === 0) {
          throw new Error('Nenhuma palavra válida encontrada');
        }

        // Obter palavras já usadas hoje pelo usuário
        const usedToday = await getTodayUsedWords();
        
        // Filtrar palavras não usadas hoje
        const availableWords = validWords.filter(word => !usedToday.has(word.toUpperCase()));
        
        logger.info('📊 Palavras disponíveis', {
          total: validWords.length,
          usedToday: usedToday.size,
          available: availableWords.length
        }, 'SIMPLE_WORD_SELECTION');

        // Se poucas palavras disponíveis, usar todas as válidas
        const wordsToSelect = availableWords.length >= 5 ? availableWords : validWords;
        
        // Seleção completamente aleatória
        const selectedWords = selectRandomWordsSimple(wordsToSelect, 5);
        
        if (selectedWords.length === 0) {
          throw new Error('Falha na seleção aleatória');
        }

        logger.info('✅ Seleção aleatória concluída', {
          selected: selectedWords.length,
          words: selectedWords
        }, 'SIMPLE_WORD_SELECTION');

        setLevelWords(selectedWords);
        
        // Registrar uso das palavras (opcional, sem bloquear)
        try {
          await recordWordsUsage(selectedWords);
        } catch (recordError) {
          logger.warn('⚠️ Erro ao registrar uso das palavras', { recordError }, 'SIMPLE_WORD_SELECTION');
        }
        
      } catch (error) {
        logger.error('❌ Erro na seleção aleatória', { error }, 'SIMPLE_WORD_SELECTION');
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
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

// Função para obter palavras usadas hoje pelo usuário
const getTodayUsedWords = async (): Promise<Set<string>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return new Set();
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const { data: history, error } = await supabase
      .from('user_word_history')
      .select('word')
      .eq('user_id', user.id)
      .gte('used_at', startOfDay.toISOString());

    if (error) {
      logger.warn('Erro ao buscar histórico do dia', { error }, 'SIMPLE_WORD_SELECTION');
      return new Set();
    }

    return new Set(history?.map(h => h.word.toUpperCase()) || []);
  } catch (error) {
    logger.warn('Erro ao verificar palavras do dia', { error }, 'SIMPLE_WORD_SELECTION');
    return new Set();
  }
};

// Seleção aleatória simples - apenas embaralhar e pegar as primeiras
const selectRandomWordsSimple = (words: string[], count: number): string[] => {
  if (words.length === 0) return [];
  
  // Embaralhar usando Fisher-Yates
  const shuffled = [...words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, count);
};

// Registrar uso das palavras (simplificado)
const recordWordsUsage = async (words: string[]): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const usageRecords = words.map(word => ({
      user_id: user.id,
      word: word.toUpperCase(),
      level: 1,
      category: 'geral',
      used_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('user_word_history')
      .insert(usageRecords);

    if (error) {
      logger.warn('Erro ao registrar histórico', { error }, 'SIMPLE_WORD_SELECTION');
    }
  } catch (error) {
    logger.warn('Erro no registro de uso', { error }, 'SIMPLE_WORD_SELECTION');
  }
};

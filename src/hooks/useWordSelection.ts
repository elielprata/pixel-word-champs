
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getBoardSize } from '@/utils/boardUtils';
import { DIFFICULTY_DISTRIBUTION, getDefaultWordsForSize, normalizeText, isValidGameWord } from '@/utils/levelConfiguration';
import { wordHistoryService } from '@/services/wordHistoryService';
import { logger } from '@/utils/logger';
import { useIsMobile } from './use-mobile';

export const useWordSelection = (level: number) => {
  const [levelWords, setLevelWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isMobile = useIsMobile();

  useEffect(() => {
    const selectWordsForLevel = async () => {
      setIsLoading(true);
      setError(null);
      setDebugInfo('Iniciando seleção de palavras...');
      
      logger.info('🚀 Iniciando seleção de palavras', { 
        level, 
        isMobile,
        userAgent: navigator.userAgent 
      }, 'WORD_SELECTION');
      
      // Timeout de segurança - forçar fallback após 8 segundos para mobile, 10 para desktop
      const timeoutMs = isMobile ? 8000 : 10000;
      timeoutRef.current = setTimeout(() => {
        logger.warn('⏰ Timeout na seleção de palavras - usando fallback', { 
          level, 
          isMobile,
          timeoutMs 
        }, 'WORD_SELECTION');
        setDebugInfo(`Timeout (${timeoutMs}ms) - usando palavras padrão`);
        const fallbackWords = getDefaultWordsForSize(10);
        setLevelWords(fallbackWords);
        setIsLoading(false);
      }, timeoutMs);

      try {
        const boardSize = getBoardSize(level);
        const maxWordLength = Math.min(boardSize - 1, 8);
        
        logger.info('📏 Configuração do tabuleiro', { 
          level, 
          boardSize, 
          maxWordLength,
          isMobile 
        }, 'WORD_SELECTION');
        
        setDebugInfo(`Buscando palavras para nível ${level} (tabuleiro ${boardSize}x${boardSize}, mobile: ${isMobile})`);

        // Tentar buscar palavras do banco
        logger.info('🔍 Buscando palavras no banco de dados...', undefined, 'WORD_SELECTION');
        const { data: words, error: dbError } = await supabase
          .from('level_words')
          .select('word, difficulty, category')
          .eq('is_active', true);

        if (dbError) {
          logger.error('❌ Erro ao buscar palavras do banco', { error: dbError, isMobile }, 'WORD_SELECTION');
          throw new Error(`Erro no banco: ${dbError.message}`);
        }

        if (!words || words.length === 0) {
          logger.warn('📭 Nenhuma palavra encontrada no banco - usando fallback', { level, isMobile }, 'WORD_SELECTION');
          setDebugInfo('Banco vazio - usando palavras padrão');
          const fallbackWords = getDefaultWordsForSize(boardSize);
          setLevelWords(fallbackWords);
          setIsLoading(false);
          clearTimeout(timeoutRef.current);
          return;
        }

        setDebugInfo(`Encontradas ${words.length} palavras no banco`);
        logger.info(`📊 Encontradas ${words.length} palavras no banco`, { isMobile }, 'WORD_SELECTION');

        // Filtrar e normalizar palavras válidas
        const validWords = words
          .filter(w => w.word && typeof w.word === 'string')
          .map(w => ({
            ...w,
            normalizedWord: normalizeText(w.word)
          }))
          .filter(w => isValidGameWord(w.normalizedWord, maxWordLength));

        logger.info('🔍 Palavras após validação', { 
          totalOriginal: words.length,
          validCount: validWords.length,
          maxWordLength,
          isMobile
        }, 'WORD_SELECTION');

        if (validWords.length === 0) {
          logger.warn('⚠️ Nenhuma palavra válida após filtros - usando fallback', { 
            totalWords: words.length,
            maxWordLength,
            isMobile 
          }, 'WORD_SELECTION');
          setDebugInfo('Nenhuma palavra válida - usando palavras padrão');
          const fallbackWords = getDefaultWordsForSize(boardSize);
          setLevelWords(fallbackWords);
          setIsLoading(false);
          clearTimeout(timeoutRef.current);
          return;
        }

        setDebugInfo(`${validWords.length} palavras válidas encontradas`);

        // Tentar usar seleção inteligente com histórico
        let selectedWords: string[] = [];
        
        try {
          setDebugInfo('Tentando seleção inteligente...');
          
          // Obter usuário atual
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            selectedWords = await wordHistoryService.selectRandomizedWords({
              userId: user.id,
              level,
              maxWordsNeeded: 5
            });
            
            if (selectedWords.length >= 5) {
              logger.info('🎯 Seleção inteligente bem-sucedida', { 
                wordsCount: selectedWords.length,
                isMobile 
              }, 'WORD_SELECTION');
              setDebugInfo(`Seleção inteligente: ${selectedWords.length} palavras`);
              setLevelWords(selectedWords);
              setIsLoading(false);
              clearTimeout(timeoutRef.current);
              return;
            }
          }
        } catch (smartSelectionError) {
          logger.warn('⚠️ Erro na seleção inteligente - usando seleção simples', { 
            error: smartSelectionError,
            isMobile 
          }, 'WORD_SELECTION');
          setDebugInfo('Seleção inteligente falhou - usando seleção simples');
        }

        // Fallback: seleção simples por distribuição de dificuldade
        setDebugInfo('Usando seleção simples por dificuldade...');
        selectedWords = selectWordsByDifficulty(validWords);

        if (selectedWords.length === 0) {
          logger.warn('⚠️ Seleção por dificuldade falhou - usando seleção aleatória', { isMobile }, 'WORD_SELECTION');
          setDebugInfo('Seleção por dificuldade falhou - seleção aleatória');
          selectedWords = selectRandomWords(validWords, 5);
        }

        if (selectedWords.length === 0) {
          logger.error('❌ Todas as seleções falharam - usando palavras padrão', { isMobile }, 'WORD_SELECTION');
          setDebugInfo('Todas as seleções falharam - usando palavras padrão');
          selectedWords = getDefaultWordsForSize(boardSize);
        }

        // Normalizar palavras finais
        const finalWords = selectedWords
          .map(word => normalizeText(word))
          .filter(word => isValidGameWord(word, maxWordLength));
        
        if (finalWords.length < selectedWords.length) {
          logger.warn('⚠️ Algumas palavras removidas por normalização', { 
            original: selectedWords.length,
            final: finalWords.length,
            isMobile 
          }, 'WORD_SELECTION');
        }

        if (finalWords.length === 0) {
          logger.error('❌ Nenhuma palavra final válida - usando fallback absoluto', { isMobile }, 'WORD_SELECTION');
          const absoluteFallback = getDefaultWordsForSize(boardSize);
          setLevelWords(absoluteFallback);
          setIsLoading(false);
          clearTimeout(timeoutRef.current);
          return;
        }

        logger.info('✅ Seleção de palavras concluída', { 
          level,
          wordsCount: finalWords.length,
          words: finalWords,
          isMobile 
        }, 'WORD_SELECTION');

        setDebugInfo(`Concluído: ${finalWords.length} palavras selecionadas`);
        setLevelWords(finalWords);
        
        // Tentar registrar histórico (opcional - não falhar se der erro)
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user && finalWords.length > 0) {
            await wordHistoryService.recordWordsUsage(user.id, finalWords, level);
          }
        } catch (historyError) {
          logger.warn('⚠️ Erro ao registrar histórico - continuando', { 
            error: historyError,
            isMobile 
          }, 'WORD_SELECTION');
        }
        
      } catch (error) {
        logger.error('❌ Erro crítico na seleção de palavras', { 
          error, 
          isMobile,
          userAgent: navigator.userAgent 
        }, 'WORD_SELECTION');
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        setDebugInfo(`Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`);
        
        // Fallback final: palavras padrão
        const fallbackWords = getDefaultWordsForSize(10); // Sempre 10x10 agora
        logger.info('🆘 Usando fallback final', { 
          words: fallbackWords,
          isMobile 
        }, 'WORD_SELECTION');
        setLevelWords(fallbackWords);
      } finally {
        setIsLoading(false);
        clearTimeout(timeoutRef.current);
      }
    };

    selectWordsForLevel();

    // Cleanup do timeout
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [level, isMobile]);

  return { levelWords, isLoading, error, debugInfo };
};

// Função para seleção por distribuição de dificuldade
const selectWordsByDifficulty = (words: Array<{ normalizedWord: string; difficulty: string }>): string[] => {
  const wordsByDifficulty = {
    easy: words.filter(w => w.difficulty === 'easy'),
    medium: words.filter(w => w.difficulty === 'medium'),
    hard: words.filter(w => w.difficulty === 'hard'),
    expert: words.filter(w => w.difficulty === 'expert')
  };

  const selected: string[] = [];

  // Tentar seguir a distribuição ideal
  for (const [difficulty, count] of Object.entries(DIFFICULTY_DISTRIBUTION)) {
    const availableWords = wordsByDifficulty[difficulty as keyof typeof wordsByDifficulty] || [];
    
    for (let i = 0; i < count && selected.length < 5; i++) {
      const candidateWords = availableWords.filter(w => !selected.includes(w.normalizedWord));
      
      if (candidateWords.length > 0) {
        const randomWord = candidateWords[Math.floor(Math.random() * candidateWords.length)];
        selected.push(randomWord.normalizedWord);
      }
    }
  }

  return selected;
};

// Função para seleção aleatória simples
const selectRandomWords = (words: Array<{ normalizedWord: string }>, count: number): string[] => {
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(w => w.normalizedWord);
};


import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { wordHistoryService } from '@/services/wordHistoryService';
import { getBoardSize } from '@/utils/boardUtils';
import { getDefaultWordsForSize } from '@/utils/levelConfiguration';

interface UseWordSelectionOptions {
  competitionId?: string;
  excludeCategories?: string[];
}

export const useWordSelection = (
  level: number, 
  options: UseWordSelectionOptions = {}
) => {
  const { user } = useAuth();
  const [levelWords, setLevelWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRandomizedWords = async () => {
      if (!user) {
        console.log('👤 Usuário não logado, usando palavras padrão');
        const size = getBoardSize(level);
        const defaultWords = getDefaultWordsForSize(size);
        setLevelWords(defaultWords);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log(`🎲 Buscando palavras randomizadas para nível ${level}...`);

        // Usar o novo sistema de seleção randomizada
        const selectedWords = await wordHistoryService.selectRandomizedWords({
          userId: user.id,
          level,
          competitionId: options.competitionId,
          excludeCategories: options.excludeCategories,
          maxWordsNeeded: 5
        });

        if (selectedWords.length === 0) {
          console.log('⚠️ Nenhuma palavra selecionada, usando padrão...');
          const size = getBoardSize(level);
          const defaultWords = getDefaultWordsForSize(size);
          setLevelWords(defaultWords);
        } else {
          console.log('✅ Palavras randomizadas selecionadas:', selectedWords);
          setLevelWords(selectedWords);
          
          // Registrar o uso das palavras
          await wordHistoryService.recordWordsUsage(
            user.id,
            selectedWords,
            level,
            options.competitionId
          );
        }
      } catch (error) {
        console.error('❌ Erro na seleção de palavras:', error);
        const size = getBoardSize(level);
        const defaultWords = getDefaultWordsForSize(size);
        setLevelWords(defaultWords);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRandomizedWords();
  }, [level, user, options.competitionId, options.excludeCategories?.join(',')]);

  return { 
    levelWords, 
    isLoading,
    // Função para forçar nova seleção
    refreshWords: () => {
      if (user) {
        const fetchWords = async () => {
          const selectedWords = await wordHistoryService.selectRandomizedWords({
            userId: user.id,
            level,
            competitionId: options.competitionId,
            excludeCategories: options.excludeCategories,
            maxWordsNeeded: 5
          });
          setLevelWords(selectedWords);
        };
        fetchWords();
      }
    }
  };
};

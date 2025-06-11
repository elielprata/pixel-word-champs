
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { wordHistoryService } from '@/services/wordHistoryService';

interface CompetitionWordsConfig {
  competitionId: string;
  level: number;
  enforceUniqueCategories?: boolean;
  preferredCategories?: string[];
  excludeRecentDays?: number;
}

export const useCompetitionWords = (config: CompetitionWordsConfig) => {
  const { user } = useAuth();
  const [words, setWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usedCategories, setUsedCategories] = useState<string[]>([]);

  useEffect(() => {
    const loadCompetitionWords = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log(`🏆 Carregando palavras para competição ${config.competitionId}`);

        // Configurar critérios de seleção
        const excludeCategories = config.enforceUniqueCategories ? usedCategories : [];
        
        const selectedWords = await wordHistoryService.selectRandomizedWords({
          userId: user.id,
          level: config.level,
          competitionId: config.competitionId,
          excludeCategories,
          maxWordsNeeded: 5
        });

        if (selectedWords.length > 0) {
          setWords(selectedWords);
          
          // Registrar uso imediatamente
          await wordHistoryService.recordWordsUsage(
            user.id,
            selectedWords,
            config.level,
            config.competitionId
          );

          console.log(`✅ ${selectedWords.length} palavras carregadas para competição`);
        } else {
          console.log('⚠️ Nenhuma palavra disponível para a competição');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar palavras da competição:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompetitionWords();
  }, [
    user, 
    config.competitionId, 
    config.level, 
    config.enforceUniqueCategories,
    usedCategories.join(',')
  ]);

  const markCategoryAsUsed = (category: string) => {
    setUsedCategories(prev => {
      if (!prev.includes(category)) {
        return [...prev, category];
      }
      return prev;
    });
  };

  const resetUsedCategories = () => {
    setUsedCategories([]);
  };

  return {
    words,
    isLoading,
    usedCategories,
    markCategoryAsUsed,
    resetUsedCategories,
    // Função para forçar nova seleção com diferentes critérios
    refreshWithNewCriteria: async (newExclusions: string[] = []) => {
      if (!user) return;
      
      const newWords = await wordHistoryService.selectRandomizedWords({
        userId: user.id,
        level: config.level,
        competitionId: config.competitionId,
        excludeCategories: [...usedCategories, ...newExclusions],
        maxWordsNeeded: 5
      });
      
      if (newWords.length > 0) {
        setWords(newWords);
        await wordHistoryService.recordWordsUsage(
          user.id,
          newWords,
          config.level,
          config.competitionId
        );
      }
    }
  };
};

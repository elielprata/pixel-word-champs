
import { useState, useEffect } from 'react';
import { competitionHistoryService } from '@/services/competitionHistoryService';
import { getCurrentBrasiliaTime } from '@/utils/brasiliaTimeUnified';

export const useCompetitionHistory = (competitionId?: string, userId?: string) => {
  const [history, setHistory] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Carregando histórico de competições:', {
        competitionId,
        userId,
        timestamp: getCurrentBrasiliaTime()
      });

      const historyData = await competitionHistoryService.getCompetitionHistory(
        competitionId, 
        userId
      );

      setHistory(historyData);

      // Se for um usuário específico, carregar também as estatísticas
      if (userId) {
        const stats = await competitionHistoryService.getUserCompetitionStats(userId);
        setUserStats(stats);
      }

    } catch (err) {
      setError('Erro ao carregar histórico de competições');
      console.error('❌ Erro no hook de histórico:', err, {
        timestamp: getCurrentBrasiliaTime()
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [competitionId, userId]);

  return {
    history,
    userStats,
    isLoading,
    error,
    refetch: loadHistory
  };
};

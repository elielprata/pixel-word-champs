
import { useState, useEffect } from 'react';
import { challengeRankingService, ChallengeRanking } from '@/services/challengeRankingService';

export function useChallengeRanking(challengeId: number) {
  const [ranking, setRanking] = useState<ChallengeRanking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRanking = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Usar dados mock por enquanto
      const mockRanking = challengeRankingService.getMockRanking(challengeId);
      setRanking(mockRanking);
      
      // Quando conectado ao backend, usar:
      // const response = await challengeRankingService.getChallengeRanking(challengeId);
      // if (response.success && response.data) {
      //   setRanking(response.data);
      // }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar ranking');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, [challengeId]);

  const refetch = () => {
    fetchRanking();
  };

  return {
    ranking,
    isLoading,
    error,
    refetch
  };
}

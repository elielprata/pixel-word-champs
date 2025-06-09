
import { useState, useEffect } from 'react';
import { rankingApi } from '@/api/rankingApi';
import { useAuth } from '@/hooks/useAuth';

export const useHistoricalRanking = () => {
  const { user } = useAuth();
  const [historicalCompetitions, setHistoricalCompetitions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistoricalRanking = async () => {
    if (!user?.id) {
      setHistoricalCompetitions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Carregando histórico de competições...');
      
      const historical = await rankingApi.getHistoricalRanking(user.id);
      console.log('📊 Histórico carregado:', historical.length);

      setHistoricalCompetitions(historical);
    } catch (err) {
      console.error('❌ Erro ao carregar histórico:', err);
      setError('Erro ao carregar histórico');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistoricalRanking();
  }, [user?.id]);

  return {
    historicalCompetitions,
    isLoading,
    error,
    refetch: loadHistoricalRanking
  };
};

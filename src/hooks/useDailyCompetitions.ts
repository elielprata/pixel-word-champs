
import { useState, useEffect } from 'react';
import { dailyCompetitionService } from '@/services/dailyCompetitionService';

export const useDailyCompetitions = () => {
  const [activeCompetitions, setActiveCompetitions] = useState<any[]>([]);
  const [competitionRankings, setCompetitionRankings] = useState<Record<string, any[]>>({});
  const [userParticipations, setUserParticipations] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveCompetitions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await dailyCompetitionService.getActiveDailyCompetitions();
      
      if (response.success) {
        setActiveCompetitions(response.data);
        
        // Carregar rankings para cada competição ativa
        const rankings: Record<string, any[]> = {};
        for (const competition of response.data) {
          const rankingResponse = await dailyCompetitionService.getDailyCompetitionRanking(competition.id);
          if (rankingResponse.success) {
            rankings[competition.id] = rankingResponse.data;
          }
        }
        setCompetitionRankings(rankings);
      } else {
        setError(response.error || 'Erro ao carregar competições diárias');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar dados das competições diárias:', err);
      setError('Erro ao carregar dados das competições diárias');
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserParticipation = async (userId: string, competitionId: string): Promise<boolean> => {
    try {
      const hasParticipated = await dailyCompetitionService.checkUserParticipation(userId, competitionId);
      setUserParticipations(prev => ({
        ...prev,
        [`${userId}-${competitionId}`]: hasParticipated
      }));
      return hasParticipated;
    } catch (error) {
      console.error('❌ Erro ao verificar participação:', error);
      return false;
    }
  };

  const refreshRanking = async (competitionId: string) => {
    try {
      const response = await dailyCompetitionService.getDailyCompetitionRanking(competitionId);
      if (response.success) {
        setCompetitionRankings(prev => ({
          ...prev,
          [competitionId]: response.data
        }));
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar ranking:', error);
    }
  };

  useEffect(() => {
    fetchActiveCompetitions();
  }, []);

  return {
    activeCompetitions,
    competitionRankings,
    userParticipations,
    isLoading,
    error,
    refetch: fetchActiveCompetitions,
    refreshRanking,
    checkUserParticipation
  };
};

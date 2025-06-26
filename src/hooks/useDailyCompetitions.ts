
import { useState, useEffect } from 'react';
import { dailyCompetitionService } from '@/services/dailyCompetitionService';
import { getCurrentBrasiliaTime } from '@/utils/brasiliaTimeUnified';

export const useDailyCompetitions = () => {
  const [activeCompetitions, setActiveCompetitions] = useState<any[]>([]);
  const [competitionRankings, setCompetitionRankings] = useState<Record<string, any[]>>({});
  const [userParticipations, setUserParticipations] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveCompetitions = async () => {
    console.log('🎯 Iniciando busca por competições diárias ativas...', {
      timestamp: getCurrentBrasiliaTime()
    });
    setIsLoading(true);
    setError(null);

    try {
      const response = await dailyCompetitionService.getActiveDailyCompetitions();
      console.log('📊 Resposta do serviço:', response, {
        timestamp: getCurrentBrasiliaTime()
      });
      
      if (response.success) {
        console.log('✅ Competições encontradas:', response.data, {
          timestamp: getCurrentBrasiliaTime()
        });
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
        console.error('❌ Erro na resposta:', response.error, {
          timestamp: getCurrentBrasiliaTime()
        });
        setError(response.error || 'Erro ao carregar competições diárias');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar dados das competições diárias:', err, {
        timestamp: getCurrentBrasiliaTime()
      });
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
      console.error('❌ Erro ao verificar participação:', error, {
        timestamp: getCurrentBrasiliaTime()
      });
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
      console.error('❌ Erro ao atualizar ranking:', error, {
        timestamp: getCurrentBrasiliaTime()
      });
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

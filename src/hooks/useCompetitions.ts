
import { useState, useEffect } from 'react';
import { competitionService } from '@/services/competitionService';
import { customCompetitionService } from '@/services/customCompetitionService';
import { Competition } from '@/types';

export const useCompetitions = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [customCompetitions, setCustomCompetitions] = useState<any[]>([]);
  const [dailyCompetition, setDailyCompetition] = useState<Competition | null>(null);
  const [weeklyCompetition, setWeeklyCompetition] = useState<Competition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompetitions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching all competitions...');
      
      const [
        competitionsResponse, 
        customCompetitionsResponse,
        dailyResponse, 
        weeklyResponse
      ] = await Promise.all([
        competitionService.getActiveCompetitions(),
        customCompetitionService.getCustomCompetitions(),
        competitionService.getDailyCompetition(),
        competitionService.getWeeklyCompetition()
      ]);

      console.log('📊 Competition responses:', {
        competitions: competitionsResponse,
        custom: customCompetitionsResponse,
        daily: dailyResponse,
        weekly: weeklyResponse
      });

      if (competitionsResponse.success) {
        setCompetitions(competitionsResponse.data);
        console.log('✅ System competitions set:', competitionsResponse.data.length);
      } else {
        console.error('❌ Error loading system competitions:', competitionsResponse.error);
        setError(competitionsResponse.error || 'Erro ao carregar competições');
      }

      if (customCompetitionsResponse.success) {
        setCustomCompetitions(customCompetitionsResponse.data);
        console.log('✅ Custom competitions set:', customCompetitionsResponse.data.length);
      } else {
        console.error('❌ Error loading custom competitions:', customCompetitionsResponse.error);
      }

      if (dailyResponse.success) {
        setDailyCompetition(dailyResponse.data);
        console.log('✅ Daily competition set');
      }

      if (weeklyResponse.success) {
        setWeeklyCompetition(weeklyResponse.data);
        console.log('✅ Weekly competition set');
      }
    } catch (err) {
      console.error('❌ Error loading competitions data:', err);
      setError('Erro ao carregar dados das competições');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  return {
    competitions,
    customCompetitions,
    dailyCompetition,
    weeklyCompetition,
    isLoading,
    error,
    refetch: fetchCompetitions
  };
};

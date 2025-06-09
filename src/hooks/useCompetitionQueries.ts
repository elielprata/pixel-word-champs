
import { useState, useEffect } from 'react';
import { competitionService } from '@/services/competitionService';
import { customCompetitionService } from '@/services/customCompetitionService';
import { Competition } from '@/types';

export const useCompetitionQueries = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [customCompetitions, setCustomCompetitions] = useState<any[]>([]);
  const [dailyCompetition, setDailyCompetition] = useState<Competition | null>(null);
  const [weeklyCompetition, setWeeklyCompetition] = useState<Competition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveCompetitions = async () => {
    try {
      const response = await competitionService.getActiveCompetitions();
      
      if (response.success) {
        setCompetitions(response.data);
      } else {
        throw new Error(response.error || 'Erro ao carregar competições');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar competições ativas:', err);
      throw err;
    }
  };

  const fetchCustomCompetitions = async () => {
    try {
      const response = await customCompetitionService.getCustomCompetitions();
      
      if (response.success) {
        setCustomCompetitions(response.data);
      } else {
        throw new Error(response.error || 'Erro ao carregar competições customizadas');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar competições customizadas:', err);
      throw err;
    }
  };

  const fetchDailyCompetition = async () => {
    try {
      const response = await competitionService.getDailyCompetition();
      
      if (response.success) {
        setDailyCompetition(response.data);
      } else {
        throw new Error(response.error || 'Erro ao carregar competição diária');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar competição diária:', err);
      throw err;
    }
  };

  const fetchWeeklyCompetition = async () => {
    try {
      const response = await competitionService.getWeeklyCompetition();
      
      if (response.success) {
        setWeeklyCompetition(response.data);
      } else {
        throw new Error(response.error || 'Erro ao carregar competição semanal');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar competição semanal:', err);
      throw err;
    }
  };

  return {
    competitions,
    customCompetitions,
    dailyCompetition,
    weeklyCompetition,
    isLoading,
    error,
    setIsLoading,
    setError,
    fetchActiveCompetitions,
    fetchCustomCompetitions,
    fetchDailyCompetition,
    fetchWeeklyCompetition
  };
};

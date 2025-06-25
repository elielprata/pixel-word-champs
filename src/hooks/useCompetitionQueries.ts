
import { useState, useEffect, useCallback, useMemo } from 'react';
import { competitionService } from '@/services/competitionService';
import { customCompetitionService } from '@/services/customCompetitionService';
import { Competition } from '@/types';
import { logger } from '@/utils/logger';

export const useCompetitionQueries = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [customCompetitions, setCustomCompetitions] = useState<any[]>([]);
  const [dailyCompetition, setDailyCompetition] = useState<Competition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveCompetitions = async () => {
    try {
      const response = await competitionService.getActiveCompetitions();
      
      if (response.success) {
        setCompetitions(response.data || []);
      } else {
        throw new Error(response.error || 'Erro ao carregar competições');
      }
    } catch (err) {
      logger.error('Erro ao carregar competições ativas', { error: err }, 'COMPETITION_QUERIES');
      throw err;
    }
  };

  const fetchCustomCompetitions = async () => {
    try {
      const response = await customCompetitionService.getCustomCompetitions();
      
      if (response.success) {
        setCustomCompetitions(response.data || []);
      } else {
        throw new Error(response.error || 'Erro ao carregar competições customizadas');
      }
    } catch (err) {
      logger.error('Erro ao carregar competições customizadas', { error: err }, 'COMPETITION_QUERIES');
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
      logger.error('Erro ao carregar competição diária', { error: err }, 'COMPETITION_QUERIES');
      throw err;
    }
  };

  return {
    competitions,
    customCompetitions,
    dailyCompetition,
    isLoading,
    error,
    setIsLoading,
    setError,
    fetchActiveCompetitions,
    fetchCustomCompetitions,
    fetchDailyCompetition
  };
};

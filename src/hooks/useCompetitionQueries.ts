
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Competition } from '@/types';
import { logger } from '@/utils/logger';

export const useCompetitionQueries = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [customCompetitions, setCustomCompetitions] = useState<any[]>([]);
  const [dailyCompetition, setDailyCompetition] = useState<Competition | null>(null);
  const [weeklyCompetition, setWeeklyCompetition] = useState<Competition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveCompetitions = async () => {
    try {
      logger.debug('Buscando competições ativas', undefined, 'COMPETITION_QUERIES');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('status', 'active')
        .order('start_date', { ascending: true });

      if (error) {
        logger.error('Erro ao carregar competições ativas', { error: error.message }, 'COMPETITION_QUERIES');
        throw new Error(error.message);
      }

      setCompetitions(data || []);
      logger.info('Competições ativas carregadas', { count: data?.length || 0 }, 'COMPETITION_QUERIES');
    } catch (err: any) {
      logger.error('Erro ao carregar competições ativas', { error: err.message }, 'COMPETITION_QUERIES');
      throw err;
    }
  };

  const fetchCustomCompetitions = async () => {
    try {
      logger.debug('Buscando competições customizadas', undefined, 'COMPETITION_QUERIES');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao carregar competições customizadas', { error: error.message }, 'COMPETITION_QUERIES');
        throw new Error(error.message);
      }

      setCustomCompetitions(data || []);
      logger.info('Competições customizadas carregadas', { count: data?.length || 0 }, 'COMPETITION_QUERIES');
    } catch (err: any) {
      logger.error('Erro ao carregar competições customizadas', { error: err.message }, 'COMPETITION_QUERIES');
      throw err;
    }
  };

  const fetchDailyCompetition = async () => {
    try {
      logger.debug('Buscando competição diária', undefined, 'COMPETITION_QUERIES');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'challenge')
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Erro ao carregar competição diária', { error: error.message }, 'COMPETITION_QUERIES');
        throw new Error(error.message);
      }

      setDailyCompetition(data);
      logger.info('Competição diária carregada', { found: !!data }, 'COMPETITION_QUERIES');
    } catch (err: any) {
      logger.error('Erro ao carregar competição diária', { error: err.message }, 'COMPETITION_QUERIES');
      throw err;
    }
  };

  const fetchWeeklyCompetition = async () => {
    try {
      logger.debug('Buscando competição semanal', undefined, 'COMPETITION_QUERIES');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'tournament')
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Erro ao carregar competição semanal', { error: error.message }, 'COMPETITION_QUERIES');
        throw new Error(error.message);
      }

      setWeeklyCompetition(data);
      logger.info('Competição semanal carregada', { found: !!data }, 'COMPETITION_QUERIES');
    } catch (err: any) {
      logger.error('Erro ao carregar competição semanal', { error: err.message }, 'COMPETITION_QUERIES');
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

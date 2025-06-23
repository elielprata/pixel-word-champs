
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

      // Mapear dados do banco para o tipo Competition
      const mappedCompetitions: Competition[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        theme: item.theme || '',
        start_date: item.start_date,
        end_date: item.end_date,
        status: item.status,
        type: item.competition_type === 'challenge' ? 'daily' : item.competition_type === 'tournament' ? 'weekly' : 'custom',
        competition_type: item.competition_type,
        prize_pool: item.prize_pool || 0,
        total_participants: 0,
        max_participants: item.max_participants || 1000,
        is_active: item.status === 'active',
        created_at: item.created_at || '',
        updated_at: item.updated_at || ''
      }));

      setCompetitions(mappedCompetitions);
      logger.info('Competições ativas carregadas', { count: mappedCompetitions.length }, 'COMPETITION_QUERIES');
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

      const mappedDaily: Competition | null = data ? {
        id: data.id,
        title: data.title,
        description: data.description || '',
        theme: data.theme || '',
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status,
        type: 'daily',
        competition_type: data.competition_type,
        prize_pool: data.prize_pool || 0,
        total_participants: 0,
        max_participants: data.max_participants || 1000,
        is_active: data.status === 'active',
        created_at: data.created_at || '',
        updated_at: data.updated_at || ''
      } : null;

      setDailyCompetition(mappedDaily);
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

      const mappedWeekly: Competition | null = data ? {
        id: data.id,
        title: data.title,
        description: data.description || '',
        theme: data.theme || '',
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status,
        type: 'weekly',
        competition_type: data.competition_type,
        prize_pool: data.prize_pool || 0,
        total_participants: 0,
        max_participants: data.max_participants || 1000,
        is_active: data.status === 'active',
        created_at: data.created_at || '',
        updated_at: data.updated_at || ''
      } : null;

      setWeeklyCompetition(mappedWeekly);
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


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WeeklyConfig {
  id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'scheduled' | 'completed';
  activated_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useWeeklyConfig = () => {
  const [activeConfig, setActiveConfig] = useState<WeeklyConfig | null>(null);
  const [scheduledConfigs, setScheduledConfigs] = useState<WeeklyConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfigurations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Carregar competição ativa
      const { data: activeData, error: activeError } = await supabase
        .from('weekly_config')
        .select('*')
        .eq('status', 'active')
        .maybeSingle();

      if (activeError && activeError.code !== 'PGRST116') {
        throw activeError;
      }

      setActiveConfig(activeData);

      // Carregar competições agendadas
      const { data: scheduledData, error: scheduledError } = await supabase
        .from('weekly_config')
        .select('*')
        .eq('status', 'scheduled')
        .order('start_date', { ascending: true });

      if (scheduledError) {
        throw scheduledError;
      }

      setScheduledConfigs(scheduledData || []);

    } catch (err: any) {
      console.error('Erro ao carregar configurações:', err);
      setError(err.message || 'Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleCompetition = async (startDate: string, endDate: string) => {
    try {
      const { data, error } = await supabase
        .from('weekly_config')
        .insert({
          start_date: startDate,
          end_date: endDate,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;

      await loadConfigurations();
      return { success: true, data };
    } catch (err: any) {
      console.error('Erro ao agendar competição:', err);
      return { success: false, error: err.message };
    }
  };

  const finalizeCompetition = async () => {
    try {
      const { data, error } = await supabase.rpc('finalize_weekly_competition');

      if (error) throw error;

      if (data.success) {
        await loadConfigurations();
        return { success: true, data };
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (err: any) {
      console.error('Erro ao finalizar competição:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    loadConfigurations();
  }, []);

  return {
    activeConfig,
    scheduledConfigs,
    isLoading,
    error,
    loadConfigurations,
    scheduleCompetition,
    finalizeCompetition
  };
};

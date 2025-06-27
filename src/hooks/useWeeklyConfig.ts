
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { parseFinalizeResult, type FinalizeResult } from '@/utils/typeGuards';

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
  const [completedConfigs, setCompletedConfigs] = useState<WeeklyConfig[]>([]);
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

      setActiveConfig(activeData as WeeklyConfig | null);

      // Carregar competições agendadas
      const { data: scheduledData, error: scheduledError } = await supabase
        .from('weekly_config')
        .select('*')
        .eq('status', 'scheduled')
        .order('start_date', { ascending: true });

      if (scheduledError) {
        throw scheduledError;
      }

      setScheduledConfigs((scheduledData || []) as WeeklyConfig[]);

      // Carregar competições finalizadas (últimas 5)
      const { data: completedData, error: completedError } = await supabase
        .from('weekly_config')
        .select('*')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(5);

      if (completedError) {
        throw completedError;
      }

      setCompletedConfigs((completedData || []) as WeeklyConfig[]);

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

  const updateCompetition = async (competitionId: string, startDate: string, endDate: string) => {
    try {
      const { data, error } = await supabase.rpc('update_scheduled_competition', {
        competition_id: competitionId,
        new_start_date: startDate,
        new_end_date: endDate
      });

      if (error) throw error;

      if (data.success) {
        await loadConfigurations();
        return { success: true, data };
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error('Erro ao atualizar competição:', err);
      return { success: false, error: err.message };
    }
  };

  const updateActiveCompetitionEndDate = async (competitionId: string, endDate: string) => {
    try {
      const { data, error } = await supabase.rpc('update_active_competition_end_date', {
        competition_id: competitionId,
        new_end_date: endDate
      });

      if (error) throw error;

      if (data.success) {
        await loadConfigurations();
        return { success: true, data };
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error('Erro ao atualizar data de fim da competição ativa:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteCompetition = async (competitionId: string) => {
    try {
      const { data, error } = await supabase.rpc('delete_scheduled_competition', {
        competition_id: competitionId
      });

      if (error) throw error;

      if (data.success) {
        await loadConfigurations();
        return { success: true, data };
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error('Erro ao excluir competição:', err);
      return { success: false, error: err.message };
    }
  };

  const finalizeCompetition = async () => {
    try {
      const { data, error } = await supabase.rpc('finalize_weekly_competition');

      if (error) throw error;

      // Usar parsing seguro para converter o resultado
      const result = parseFinalizeResult(data);
      
      if (result.success) {
        await loadConfigurations();
        return { success: true, data: result };
      } else {
        throw new Error(result.error || 'Erro desconhecido');
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
    completedConfigs,
    isLoading,
    error,
    loadConfigurations,
    scheduleCompetition,
    updateCompetition,
    updateActiveCompetitionEndDate,
    deleteCompetition,
    finalizeCompetition
  };
};

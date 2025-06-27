import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { parseFinalizeResult, type FinalizeResult } from '@/utils/typeGuards';
import { WeeklyConfig, WeeklyConfigRpcResponse, isWeeklyConfigRpcResponse } from '@/types/weeklyConfig';

export const useWeeklyConfig = () => {
  const [activeConfig, setActiveConfig] = useState<WeeklyConfig | null>(null);
  const [scheduledConfigs, setScheduledConfigs] = useState<WeeklyConfig[]>([]);
  const [completedConfigs, setCompletedConfigs] = useState<WeeklyConfig[]>([]);
  const [lastCompletedConfig, setLastCompletedConfig] = useState<WeeklyConfig | null>(null);
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

      // Carregar competições finalizadas (últimas 10, ordenadas por data de finalização)
      const { data: completedData, error: completedError } = await supabase
        .from('weekly_config')
        .select('*')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10);

      if (completedError) {
        throw completedError;
      }

      const completedList = (completedData || []) as WeeklyConfig[];
      setCompletedConfigs(completedList);
      
      // Definir a última competição finalizada para uso como referência
      if (completedList.length > 0) {
        setLastCompletedConfig(completedList[0]);
      }

    } catch (err: any) {
      console.error('Erro ao carregar configurações:', err);
      setError(err.message || 'Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para calcular próximas datas baseada na última configuração disponível
  const calculateNextDates = () => {
    let referenceEndDate: Date;
    
    if (scheduledConfigs.length > 0) {
      // Se há competições agendadas, usar a última como referência
      const lastScheduled = scheduledConfigs[scheduledConfigs.length - 1];
      referenceEndDate = new Date(lastScheduled.end_date);
    } else if (activeConfig) {
      // Se há competição ativa, usar ela como referência
      referenceEndDate = new Date(activeConfig.end_date);
    } else if (lastCompletedConfig) {
      // Se há apenas competições finalizadas, usar a última como referência
      referenceEndDate = new Date(lastCompletedConfig.end_date);
    } else {
      // Fallback: usar data atual
      referenceEndDate = new Date();
    }
    
    // Calcular próxima data de início (dia seguinte à última data de fim)
    const nextStart = new Date(referenceEndDate);
    nextStart.setDate(nextStart.getDate() + 1);
    
    // Calcular data de fim (7 dias depois do início)
    const nextEnd = new Date(nextStart);
    nextEnd.setDate(nextEnd.getDate() + 6);
    
    return {
      startDate: nextStart.toISOString().split('T')[0],
      endDate: nextEnd.toISOString().split('T')[0]
    };
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

      // Type casting com validação
      const response = data as unknown as WeeklyConfigRpcResponse;
      
      if (isWeeklyConfigRpcResponse(response) && response.success) {
        await loadConfigurations();
        return { success: true, data: response };
      } else {
        throw new Error(response?.error || 'Erro desconhecido');
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

      // Type casting com validação
      const response = data as unknown as WeeklyConfigRpcResponse;
      
      if (isWeeklyConfigRpcResponse(response) && response.success) {
        await loadConfigurations();
        return { success: true, data: response };
      } else {
        throw new Error(response?.error || 'Erro desconhecido');
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

      // Type casting com validação
      const response = data as unknown as WeeklyConfigRpcResponse;
      
      if (isWeeklyConfigRpcResponse(response) && response.success) {
        await loadConfigurations();
        return { success: true, data: response };
      } else {
        throw new Error(response?.error || 'Erro desconhecido');
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
    lastCompletedConfig,
    isLoading,
    error,
    loadConfigurations,
    scheduleCompetition,
    updateCompetition,
    updateActiveCompetitionEndDate,
    deleteCompetition,
    finalizeCompetition,
    calculateNextDates
  };
};

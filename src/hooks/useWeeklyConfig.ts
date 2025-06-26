
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WeeklyConfig {
  id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useWeeklyConfig = () => {
  const [config, setConfig] = useState<WeeklyConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('weekly_config')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (queryError) {
        throw queryError;
      }

      setConfig(data);
    } catch (err: any) {
      console.error('Erro ao carregar configuração semanal:', err);
      setError(err.message || 'Erro ao carregar configuração');
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async (startDate: string, endDate: string) => {
    try {
      // Desativar configurações existentes
      await supabase
        .from('weekly_config')
        .update({ is_active: false })
        .eq('is_active', true);

      // Criar nova configuração
      const { data, error } = await supabase
        .from('weekly_config')
        .insert({
          start_date: startDate,
          end_date: endDate,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setConfig(data);
      return { success: true };
    } catch (err: any) {
      console.error('Erro ao atualizar configuração:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return {
    config,
    isLoading,
    error,
    loadConfig,
    updateConfig
  };
};

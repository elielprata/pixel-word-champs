
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { secureLogger } from '@/utils/secureLogger';

interface WeeklyConfig {
  id: string;
  start_day_of_week: number;
  duration_days: number;
  custom_start_date: string | null;
  custom_end_date: string | null;
  is_active: boolean;
}

export const useWeeklyConfig = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<WeeklyConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Carregando configuração semanal...');

      const { data, error } = await supabase
        .from('weekly_config')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // Alterado de .single() para .maybeSingle()

      if (error) {
        console.error('❌ Erro ao carregar configuração:', error);
        throw error;
      }

      console.log('✅ Configuração carregada:', data);
      setConfig(data || null);
      secureLogger.debug('Configuração semanal carregada', { config: data }, 'WEEKLY_CONFIG');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar configuração';
      console.error('❌ Erro final:', errorMessage);
      setError(errorMessage);
      secureLogger.error('Erro ao carregar configuração semanal', { error: errorMessage }, 'WEEKLY_CONFIG');
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async (newConfig: Partial<WeeklyConfig>) => {
    try {
      console.log('🔄 Atualizando configuração semanal:', newConfig);
      secureLogger.debug('Atualizando configuração semanal', { newConfig }, 'WEEKLY_CONFIG');

      // Desativar configuração atual
      if (config) {
        await supabase
          .from('weekly_config')
          .update({ is_active: false })
          .eq('id', config.id);
      }

      // Criar nova configuração
      const { data, error } = await supabase
        .from('weekly_config')
        .insert({
          start_day_of_week: newConfig.start_day_of_week ?? 0,
          duration_days: newConfig.duration_days ?? 7,
          custom_start_date: newConfig.custom_start_date || null,
          custom_end_date: newConfig.custom_end_date || null,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Configuração atualizada:', data);
      setConfig(data);
      
      toast({
        title: "Configuração atualizada",
        description: "Período semanal configurado com sucesso!",
      });

      secureLogger.info('Configuração semanal atualizada', { newConfig: data }, 'WEEKLY_CONFIG');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar configuração';
      console.error('❌ Erro ao atualizar:', errorMessage);
      setError(errorMessage);
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });

      secureLogger.error('Erro ao atualizar configuração semanal', { error: errorMessage }, 'WEEKLY_CONFIG');
    }
  };

  const resetToDefault = async () => {
    console.log('🔄 Resetando para configuração padrão...');
    await updateConfig({
      start_day_of_week: 0, // Domingo
      duration_days: 7,
      custom_start_date: null,
      custom_end_date: null
    });
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return {
    config,
    isLoading,
    error,
    updateConfig,
    resetToDefault,
    refetch: loadConfig
  };
};

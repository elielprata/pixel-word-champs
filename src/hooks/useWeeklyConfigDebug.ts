
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface WeeklyConfig {
  id: string;
  start_day_of_week: number;
  duration_days: number;
  custom_start_date: string | null;
  custom_end_date: string | null;
  is_active: boolean;
}

export const useWeeklyConfigDebug = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<WeeklyConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = async () => {
    try {
      console.log('🔍 [WeeklyConfig] Iniciando carregamento da configuração...');
      setIsLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('weekly_config')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dbError) {
        console.error('❌ [WeeklyConfig] Erro na query:', dbError);
        throw new Error(`Erro na consulta: ${dbError.message}`);
      }

      console.log('✅ [WeeklyConfig] Dados carregados:', data);
      setConfig(data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('🚨 [WeeklyConfig] Erro final no carregamento:', errorMessage);
      setError(errorMessage);
      
      // Não mostrar toast aqui para evitar spam de erro
    } finally {
      setIsLoading(false);
      console.log('🏁 [WeeklyConfig] Carregamento finalizado');
    }
  };

  const updateConfig = async (newConfig: Partial<WeeklyConfig>) => {
    try {
      console.log('🔄 [WeeklyConfig] Atualizando configuração:', newConfig);

      // Desativar configuração atual
      if (config) {
        const { error: deactivateError } = await supabase
          .from('weekly_config')
          .update({ is_active: false })
          .eq('id', config.id);

        if (deactivateError) {
          console.error('❌ [WeeklyConfig] Erro ao desativar config atual:', deactivateError);
        }
      }

      // Criar nova configuração
      const { data, error: insertError } = await supabase
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

      if (insertError) {
        console.error('❌ [WeeklyConfig] Erro ao inserir nova config:', insertError);
        throw insertError;
      }

      console.log('✅ [WeeklyConfig] Nova configuração criada:', data);
      setConfig(data);
      
      toast({
        title: "Configuração atualizada",
        description: "Período semanal configurado com sucesso!",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar configuração';
      console.error('🚨 [WeeklyConfig] Erro final na atualização:', errorMessage);
      setError(errorMessage);
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const resetToDefault = async () => {
    console.log('🔄 [WeeklyConfig] Resetando para configuração padrão...');
    await updateConfig({
      start_day_of_week: 0, // Domingo
      duration_days: 7,
      custom_start_date: null,
      custom_end_date: null
    });
  };

  useEffect(() => {
    console.log('🚀 [WeeklyConfig] Hook montado, carregando configuração...');
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

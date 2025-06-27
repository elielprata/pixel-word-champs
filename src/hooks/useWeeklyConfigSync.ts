
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface WeeklyConfigInfo {
  current_week_start: string;
  current_week_end: string;
  next_reset_date: string;
  should_reset: boolean;
}

export const useWeeklyConfigSync = () => {
  return useQuery({
    queryKey: ['weeklyConfigSync'],
    queryFn: async (): Promise<WeeklyConfigInfo> => {
      logger.info('🔄 Sincronizando configuração semanal (datas customizadas)', undefined, 'WEEKLY_CONFIG_SYNC');
      
      const { data, error } = await supabase.rpc('should_reset_weekly_ranking');
      
      if (error) {
        logger.error('❌ Erro ao sincronizar configuração semanal', { error: error.message }, 'WEEKLY_CONFIG_SYNC');
        throw error;
      }
      
      // Type assertion para converter Json para o tipo específico
      const resetData = data as any;
      
      const configInfo: WeeklyConfigInfo = {
        current_week_start: resetData.week_start,
        current_week_end: resetData.week_end,
        next_reset_date: resetData.next_reset_date,
        should_reset: resetData.should_reset
      };
      
      logger.info('✅ Configuração semanal sincronizada (datas customizadas)', { 
        period: `${configInfo.current_week_start} - ${configInfo.current_week_end}`,
        nextReset: configInfo.next_reset_date,
        shouldReset: configInfo.should_reset
      }, 'WEEKLY_CONFIG_SYNC');
      
      return configInfo;
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
    staleTime: 15000, // Considerar dados frescos por 15 segundos
  });
};

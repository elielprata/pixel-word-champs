
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ActivationResult {
  success: boolean;
  updated_count: number;
  competitions_updated: Array<{
    id: string;
    old_status: string;
    new_status: string;
    start_date: string;
    end_date: string;
  }>;
  executed_at: string;
  current_date: string;
}

export const useWeeklyCompetitionActivation = () => {
  const [isActivating, setIsActivating] = useState(false);

  const activateWeeklyCompetitions = async () => {
    try {
      setIsActivating(true);
      console.log('🔄 Chamando função RPC update_weekly_competitions_status...');

      const { data, error } = await supabase.rpc('update_weekly_competitions_status');

      if (error) {
        console.error('❌ Erro do Supabase RPC:', error);
        
        // Preservar informações completas do erro
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            ...error
          }
        };
      }

      console.log('✅ Sucesso na chamada RPC:', data);

      // Conversão segura de Json para nossa interface
      const result = data as unknown as ActivationResult;
      
      return {
        success: true,
        data: result
      };
    } catch (err: any) {
      console.error('💥 Erro na função activateWeeklyCompetitions:', err);
      
      // Preservar informações completas do erro
      return {
        success: false,
        error: {
          message: err.message,
          code: err.code,
          details: err.details,
          hint: err.hint,
          ...err
        }
      };
    } finally {
      setIsActivating(false);
    }
  };

  return {
    activateWeeklyCompetitions,
    isActivating
  };
};

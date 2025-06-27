
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

      const { data, error } = await supabase.rpc('update_weekly_competitions_status');

      if (error) {
        throw error;
      }

      const result = data as ActivationResult;
      
      return {
        success: true,
        data: result
      };
    } catch (err: any) {
      console.error('Erro ao ativar competições semanais:', err);
      return {
        success: false,
        error: err.message
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

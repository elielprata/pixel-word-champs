
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyConfigRpcResponse, isWeeklyConfigRpcResponse } from '@/types/weeklyConfig';

interface DeleteCompletedCompetitionResult {
  success: boolean;
  message?: string;
  deleted_data?: {
    competition_id: string;
    ranking_records_deleted: number;
    snapshot_deleted: boolean;
    days_since_completion: number;
  };
  error?: string;
}

export const useCompletedCompetitionOperations = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteCompletedCompetition = async (competitionId: string) => {
    try {
      setIsDeleting(true);

      const { data, error } = await supabase.rpc('delete_completed_competition', {
        competition_id: competitionId
      });

      if (error) throw error;

      const response = data as unknown as DeleteCompletedCompetitionResult;
      
      if (response.success) {
        return { success: true, data: response };
      } else {
        throw new Error(response.error || 'Erro desconhecido');
      }
    } catch (err: any) {
      console.error('Erro ao excluir competição finalizada:', err);
      return { success: false, error: err.message };
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteCompletedCompetition,
    isDeleting
  };
};

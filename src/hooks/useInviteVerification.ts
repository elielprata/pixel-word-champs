
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { useToast } from '@/hooks/use-toast';

interface InviteVerificationResult {
  activated_rewards: number;
  partial_rewards_updated: number;
  checked_at: string;
}

interface InviteSystemStats {
  totalRewards: number;
  partialRewards: number;
  processedRewards: number;
  pendingRewards: number;
  totalActivityDays: number;
  uniqueActiveUsers: number;
}

export const useInviteVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const triggerManualVerification = async () => {
    setIsVerifying(true);
    try {
      logger.info('Iniciando verificação manual de convites', undefined, 'INVITE_VERIFICATION');

      // Chamar a função do banco de dados diretamente
      const { data, error } = await supabase.rpc('check_and_activate_invites');

      if (error) {
        logger.error('Erro na verificação manual de convites', { error }, 'INVITE_VERIFICATION');
        toast({
          title: "Erro na verificação",
          description: "Não foi possível verificar os convites. Tente novamente.",
          variant: "destructive"
        });
        return { success: false, error: error.message };
      }

      // Tipar o resultado corretamente usando conversão segura
      const result = data as unknown as InviteVerificationResult;
      
      logger.info('Verificação manual concluída com sucesso', { data: result }, 'INVITE_VERIFICATION');
      
      toast({
        title: "Verificação concluída!",
        description: `${result.activated_rewards} recompensas foram ativadas.`,
      });

      return { success: true, data: result };
    } catch (error) {
      logger.error('Erro na verificação manual', { error }, 'INVITE_VERIFICATION');
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante a verificação.",
        variant: "destructive"
      });
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    } finally {
      setIsVerifying(false);
    }
  };

  const getInviteSystemStats = async () => {
    try {
      const { data: totalRewards } = await supabase
        .from('invite_rewards')
        .select('status')
        .throwOnError();

      const { data: activityDays } = await supabase
        .from('user_activity_days')
        .select('user_id')
        .throwOnError();

      const stats: InviteSystemStats = {
        totalRewards: totalRewards?.length || 0,
        partialRewards: totalRewards?.filter(r => r.status === 'partial').length || 0,
        processedRewards: totalRewards?.filter(r => r.status === 'processed').length || 0,
        pendingRewards: totalRewards?.filter(r => r.status === 'pending').length || 0,
        totalActivityDays: activityDays?.length || 0,
        uniqueActiveUsers: [...new Set(activityDays?.map(d => d.user_id))].length || 0
      };

      return { success: true, stats };
    } catch (error) {
      logger.error('Erro ao buscar estatísticas do sistema', { error }, 'INVITE_VERIFICATION');
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  };

  return {
    isVerifying,
    triggerManualVerification,
    getInviteSystemStats
  };
};

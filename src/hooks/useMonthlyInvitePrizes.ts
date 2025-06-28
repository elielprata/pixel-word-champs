import { useState, useEffect } from 'react';
import { monthlyInvitePrizesService, MonthlyInvitePrize } from '@/services/monthlyInvite/monthlyInvitePrizes';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export const useMonthlyInvitePrizes = (competitionId?: string) => {
  const [prizes, setPrizes] = useState<MonthlyInvitePrize[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadPrizes = async () => {
    if (!competitionId) {
      setPrizes([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await monthlyInvitePrizesService.getMonthlyPrizes(competitionId);
      
      if (response.success) {
        setPrizes(response.data as MonthlyInvitePrize[]);
      } else {
        setError(response.error || 'Erro ao carregar prêmios');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      logger.error('Erro no hook de prêmios mensais', { error: err }, 'MONTHLY_PRIZES_HOOK');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrize = async (prizeId: string, updates: Partial<MonthlyInvitePrize>) => {
    try {
      const response = await monthlyInvitePrizesService.updatePrize(prizeId, updates);
      
      if (response.success) {
        await loadPrizes(); // Recarregar lista
        toast({
          title: "Prêmio atualizado",
          description: "O prêmio foi atualizado com sucesso.",
        });
        return true;
      } else {
        toast({
          title: "Erro ao atualizar",
          description: response.error || 'Erro ao atualizar prêmio',
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Erro interno ao atualizar prêmio",
        variant: "destructive",
      });
      return false;
    }
  };

  const createPrize = async (position: number, prizeAmount: number, description?: string) => {
    if (!competitionId) {
      toast({
        title: "Erro",
        description: "ID da competição não encontrado",
        variant: "destructive",
      });
      return false;
    }

    try {
      const response = await monthlyInvitePrizesService.createPrize(competitionId, position, prizeAmount, description);
      
      if (response.success) {
        await loadPrizes(); // Recarregar lista
        toast({
          title: "Prêmio criado",
          description: "O prêmio foi criado com sucesso.",
        });
        return true;
      } else {
        toast({
          title: "Erro ao criar",
          description: response.error || 'Erro ao criar prêmio',
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Erro ao criar",
        description: "Erro interno ao criar prêmio",
        variant: "destructive",
      });
      return false;
    }
  };

  const deletePrize = async (prizeId: string) => {
    try {
      const response = await monthlyInvitePrizesService.deletePrize(prizeId);
      
      if (response.success) {
        await loadPrizes(); // Recarregar lista
        toast({
          title: "Prêmio excluído",
          description: "O prêmio foi excluído com sucesso.",
        });
        return true;
      } else {
        toast({
          title: "Erro ao excluir",
          description: response.error || 'Erro ao excluir prêmio',
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Erro interno ao excluir prêmio",
        variant: "destructive",
      });
      return false;
    }
  };

  const togglePrizeStatus = async (prizeId: string, active: boolean) => {
    try {
      const response = await monthlyInvitePrizesService.togglePrizeStatus(prizeId, active);
      
      if (response.success) {
        await loadPrizes(); // Recarregar lista
        toast({
          title: "Status alterado",
          description: `Prêmio ${active ? 'ativado' : 'desativado'} com sucesso.`,
        });
        return true;
      } else {
        toast({
          title: "Erro ao alterar status",
          description: response.error || 'Erro ao alterar status do prêmio',
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Erro ao alterar status",
        description: "Erro interno ao alterar status",
        variant: "destructive",
      });
      return false;
    }
  };

  const calculateTotalPrizePool = () => {
    return prizes
      .filter(prize => prize.active)
      .reduce((total, prize) => total + Number(prize.prize_amount), 0);
  };

  useEffect(() => {
    loadPrizes();
  }, [competitionId]);

  return {
    prizes,
    isLoading,
    error,
    updatePrize,
    createPrize,
    deletePrize,
    togglePrizeStatus,
    calculateTotalPrizePool,
    refetch: loadPrizes
  };
};

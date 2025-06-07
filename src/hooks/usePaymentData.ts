
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { prizeService } from '@/services/prizeService';
import { IndividualPrize, GroupPrize } from '@/types/payment';
import { useIndividualPrizes } from './useIndividualPrizes';
import { useGroupPrizes } from './useGroupPrizes';
import { usePrizeCalculations } from './usePrizeCalculations';

export const usePaymentData = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [individualPrizes, setIndividualPrizes] = useState<IndividualPrize[]>([]);
  const [groupPrizes, setGroupPrizes] = useState<GroupPrize[]>([]);

  const individualPrizesHook = useIndividualPrizes();
  const groupPrizesHook = useGroupPrizes();
  const { calculateTotalPrize, calculateTotalWinners } = usePrizeCalculations();

  useEffect(() => {
    loadPrizeConfigurations();
  }, []);

  const loadPrizeConfigurations = async () => {
    setIsLoading(true);
    try {
      const configurations = await prizeService.getPrizeConfigurations();
      
      // Separar prêmios individuais e em grupo
      const individual = configurations
        .filter(config => config.type === 'individual' && config.position)
        .map(config => ({
          position: config.position!,
          prize: config.prize_amount,
          id: config.id
        }))
        .sort((a, b) => a.position - b.position);

      const groups = configurations
        .filter(config => config.type === 'group')
        .map(config => ({
          id: config.id,
          name: config.group_name || `${config.position_range}`,
          range: config.position_range || '',
          totalWinners: config.total_winners,
          prizePerWinner: config.prize_amount,
          active: config.active
        }));

      setIndividualPrizes(individual);
      setGroupPrizes(groups);
    } catch (error) {
      console.error('Error loading prize configurations:', error);
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações de prêmios.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditIndividual = (position: number) => {
    individualPrizesHook.handleEditIndividual(position, individualPrizes);
  };

  const handleSaveIndividual = async (position: number) => {
    await individualPrizesHook.handleSaveIndividual(position, individualPrizes, setIndividualPrizes);
  };

  const handleEditGroup = (groupId: string) => {
    groupPrizesHook.handleEditGroup(groupId, groupPrizes);
  };

  const handleSaveGroup = async (groupId: string) => {
    await groupPrizesHook.handleSaveGroup(groupId, groupPrizes, setGroupPrizes);
  };

  const handleToggleGroup = async (groupId: string) => {
    await groupPrizesHook.handleToggleGroup(groupId, groupPrizes, setGroupPrizes);
  };

  const handleCancel = () => {
    individualPrizesHook.handleCancel();
    groupPrizesHook.handleCancel();
  };

  return {
    individualPrizes,
    groupPrizes,
    editingRow: individualPrizesHook.editingRow,
    editingGroup: groupPrizesHook.editingGroup,
    editIndividualValue: individualPrizesHook.editIndividualValue,
    editGroupPrize: groupPrizesHook.editGroupPrize,
    isLoading,
    setEditIndividualValue: individualPrizesHook.setEditIndividualValue,
    setEditGroupPrize: groupPrizesHook.setEditGroupPrize,
    handleEditIndividual,
    handleSaveIndividual,
    handleEditGroup,
    handleSaveGroup,
    handleToggleGroup,
    handleCancel,
    calculateTotalPrize: () => calculateTotalPrize(individualPrizes, groupPrizes),
    calculateTotalWinners: () => calculateTotalWinners(individualPrizes, groupPrizes),
    refetch: loadPrizeConfigurations
  };
};

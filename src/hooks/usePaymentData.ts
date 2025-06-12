
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { IndividualPrize, GroupPrize } from '@/types/payment';
import { useIndividualPrizes } from './useIndividualPrizes';
import { useGroupPrizes } from './useGroupPrizes';
import { usePrizeCalculations } from './usePrizeCalculations';

export const usePaymentData = () => {
  const [individualPrizes, setIndividualPrizes] = useState<IndividualPrize[]>([]);
  const [groupPrizes, setGroupPrizes] = useState<GroupPrize[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Individual prizes management
  const {
    editingRow,
    editIndividualValue,
    setEditIndividualValue,
    handleEditIndividual,
    handleSaveIndividual,
    handleCancel: handleCancelIndividual
  } = useIndividualPrizes();

  // Group prizes management
  const {
    editingGroup,
    editGroupPrize,
    setEditGroupPrize,
    handleEditGroup,
    handleSaveGroup,
    handleToggleGroup,
    handleCancel: handleCancelGroup
  } = useGroupPrizes();

  // Prize calculations
  const { calculateTotalPrize, calculateTotalWinners } = usePrizeCalculations();

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const { data, error } = await supabase
          .from('prize_configurations')
          .select('*');

        if (error) throw error;

        const validData = (data || [])
          .filter((item: any) => item && typeof item === 'object' && !('error' in item));

        const individual: IndividualPrize[] = [];
        const group: GroupPrize[] = [];

        validData.forEach((item: any) => {
          if (item.type === 'individual' && item.position) {
            individual.push({
              position: item.position,
              prize: item.prize_amount || 0,
              id: item.id || ''
            });
          } else if (item.type === 'group' && item.position_range) {
            group.push({
              id: item.id || '',
              name: item.group_name || '',
              range: item.position_range || '',
              totalWinners: item.total_winners || 0,
              prizePerWinner: item.prize_amount || 0,
              active: item.active || false
            });
          }
        });

        setIndividualPrizes(individual);
        setGroupPrizes(group);
      } catch (error) {
        console.error('Erro ao carregar dados de pagamento:', error);
        setIndividualPrizes([]);
        setGroupPrizes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  const handleCancel = () => {
    handleCancelIndividual();
    handleCancelGroup();
  };

  const wrappedHandleEditIndividual = (position: number) => {
    handleEditIndividual(position, individualPrizes);
  };

  const wrappedHandleSaveIndividual = async (position: number) => {
    await handleSaveIndividual(position, individualPrizes, setIndividualPrizes);
  };

  const wrappedHandleEditGroup = (id: string) => {
    handleEditGroup(id, groupPrizes);
  };

  const wrappedHandleSaveGroup = async (id: string) => {
    await handleSaveGroup(id, groupPrizes, setGroupPrizes);
  };

  const wrappedHandleToggleGroup = async (id: string) => {
    await handleToggleGroup(id, groupPrizes, setGroupPrizes);
  };

  const wrappedCalculateTotalPrize = () => {
    return calculateTotalPrize(individualPrizes, groupPrizes);
  };

  const wrappedCalculateTotalWinners = () => {
    return calculateTotalWinners(individualPrizes, groupPrizes);
  };

  return {
    individualPrizes,
    groupPrizes,
    editingRow,
    editingGroup,
    editIndividualValue,
    editGroupPrize,
    isLoading,
    setEditIndividualValue,
    setEditGroupPrize,
    handleEditIndividual: wrappedHandleEditIndividual,
    handleSaveIndividual: wrappedHandleSaveIndividual,
    handleEditGroup: wrappedHandleEditGroup,
    handleSaveGroup: wrappedHandleSaveGroup,
    handleToggleGroup: wrappedHandleToggleGroup,
    handleCancel,
    calculateTotalPrize: wrappedCalculateTotalPrize,
    calculateTotalWinners: wrappedCalculateTotalWinners
  };
};

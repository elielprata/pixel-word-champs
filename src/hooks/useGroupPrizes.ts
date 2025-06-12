
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { prizeService } from '@/services/prizeService';
import { GroupPrize } from '@/types/payment';

export const useGroupPrizes = () => {
  const { toast } = useToast();
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editGroupPrize, setEditGroupPrize] = useState<any>({});

  const parseInputValue = (value: string): number => {
    const cleanValue = value.replace(/[R$\s]/g, '').replace(',', '.');
    return parseFloat(cleanValue) || 0;
  };

  const formatInputValue = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleEditGroup = (id: string, groupPrizes: GroupPrize[]) => {
    const group = groupPrizes.find(g => g.id === id);
    if (group) {
      setEditGroupPrize({
        name: group.name,
        range: group.range,
        totalWinners: group.totalWinners.toString(),
        prizePerWinner: formatInputValue(group.prizePerWinner)
      });
      setEditingGroup(id);
    }
  };

  const handleSaveGroup = async (
    id: string, 
    groupPrizes: GroupPrize[],
    onUpdate: (updatedPrizes: GroupPrize[]) => void
  ) => {
    const prizePerWinner = parseInputValue(editGroupPrize.prizePerWinner);
    const totalWinners = parseInt(editGroupPrize.totalWinners) || 0;

    const result = await prizeService.updatePrizeConfiguration(id, {
      group_name: editGroupPrize.name,
      position_range: editGroupPrize.range,
      total_winners: totalWinners,
      prize_amount: prizePerWinner
    });

    if (result.success) {
      const updatedPrizes = groupPrizes.map(g => 
        g.id === id 
          ? { 
              ...g, 
              name: editGroupPrize.name,
              range: editGroupPrize.range,
              totalWinners,
              prizePerWinner 
            }
          : g
      );
      onUpdate(updatedPrizes);
      setEditingGroup(null);
      toast({
        title: "Premiação atualizada",
        description: "Configuração do grupo foi atualizada.",
      });
    } else {
      toast({
        title: "Erro ao atualizar",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleToggleGroup = async (
    id: string,
    groupPrizes: GroupPrize[],
    onUpdate: (updatedPrizes: GroupPrize[]) => void
  ) => {
    const group = groupPrizes.find(g => g.id === id);
    if (!group) return;

    const result = await prizeService.updatePrizeConfiguration(id, {
      active: !group.active
    });

    if (result.success) {
      const updatedPrizes = groupPrizes.map(g => 
        g.id === id ? { ...g, active: !g.active } : g
      );
      onUpdate(updatedPrizes);
      toast({
        title: "Status atualizado",
        description: `Grupo ${group.active ? 'desativado' : 'ativado'} com sucesso.`,
      });
    } else {
      toast({
        title: "Erro ao atualizar",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingGroup(null);
    setEditGroupPrize({});
  };

  return {
    editingGroup,
    editGroupPrize,
    setEditGroupPrize,
    handleEditGroup,
    handleSaveGroup,
    handleToggleGroup,
    handleCancel
  };
};

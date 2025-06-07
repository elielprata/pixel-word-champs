
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { prizeService } from '@/services/prizeService';
import { GroupPrize } from '@/types/payment';

export const useGroupPrizes = () => {
  const { toast } = useToast();
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editGroupPrize, setEditGroupPrize] = useState<string>('');

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

  const handleEditGroup = (groupId: string, groups: GroupPrize[]) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setEditGroupPrize(formatInputValue(group.prizePerWinner));
      setEditingGroup(groupId);
    }
  };

  const handleSaveGroup = async (
    groupId: string,
    groups: GroupPrize[],
    onUpdate: (updatedGroups: GroupPrize[]) => void
  ) => {
    const numericValue = parseInputValue(editGroupPrize);
    
    const result = await prizeService.updatePrizeConfiguration(groupId, {
      prize_amount: numericValue
    });

    if (result.success) {
      const updatedGroups = groups.map(group => 
        group.id === groupId 
          ? { ...group, prizePerWinner: numericValue }
          : group
      );
      onUpdate(updatedGroups);
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
    groupId: string,
    groups: GroupPrize[],
    onUpdate: (updatedGroups: GroupPrize[]) => void
  ) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const result = await prizeService.updatePrizeConfiguration(groupId, {
      active: !group.active
    });

    if (result.success) {
      const updatedGroups = groups.map(g => 
        g.id === groupId 
          ? { ...g, active: !g.active }
          : g
      );
      onUpdate(updatedGroups);
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
    setEditGroupPrize('');
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

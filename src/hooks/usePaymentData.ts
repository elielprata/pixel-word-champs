
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface IndividualPrize {
  position: number;
  prize: number;
}

interface GroupPrize {
  id: string;
  name: string;
  range: string;
  totalWinners: number;
  prizePerWinner: number;
  active: boolean;
}

export const usePaymentData = () => {
  const { toast } = useToast();
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editIndividualValue, setEditIndividualValue] = useState<string>('');
  const [editGroupPrize, setEditGroupPrize] = useState<string>('');
  
  const [individualPrizes, setIndividualPrizes] = useState<IndividualPrize[]>([
    { position: 1, prize: 1000 },
    { position: 2, prize: 500 },
    { position: 3, prize: 250 }
  ]);

  const [groupPrizes, setGroupPrizes] = useState<GroupPrize[]>([
    { id: 'group1', name: '4º ao 10º', range: '4-10', totalWinners: 7, prizePerWinner: 100, active: true },
    { id: 'group2', name: '11º ao 50º', range: '11-50', totalWinners: 40, prizePerWinner: 50, active: true },
    { id: 'group3', name: '51º ao 100º', range: '51-100', totalWinners: 50, prizePerWinner: 25, active: false }
  ]);

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

  const handleEditIndividual = (position: number) => {
    const prize = individualPrizes.find(p => p.position === position);
    if (prize) {
      setEditIndividualValue(formatInputValue(prize.prize));
      setEditingRow(position);
    }
  };

  const handleSaveIndividual = (position: number) => {
    const numericValue = parseInputValue(editIndividualValue);
    setIndividualPrizes(prev => 
      prev.map(prize => 
        prize.position === position 
          ? { ...prize, prize: numericValue }
          : prize
      )
    );
    setEditingRow(null);
    toast({
      title: "Premiação atualizada",
      description: `Configuração do ${position}º lugar foi atualizada.`,
    });
  };

  const handleEditGroup = (groupId: string) => {
    const group = groupPrizes.find(g => g.id === groupId);
    if (group) {
      setEditGroupPrize(formatInputValue(group.prizePerWinner));
      setEditingGroup(groupId);
    }
  };

  const handleSaveGroup = (groupId: string) => {
    const numericValue = parseInputValue(editGroupPrize);
    setGroupPrizes(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { ...group, prizePerWinner: numericValue }
          : group
      )
    );
    setEditingGroup(null);
    toast({
      title: "Premiação atualizada",
      description: "Configuração do grupo foi atualizada.",
    });
  };

  const handleToggleGroup = (groupId: string) => {
    setGroupPrizes(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { ...group, active: !group.active }
          : group
      )
    );
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditingGroup(null);
    setEditIndividualValue('');
    setEditGroupPrize('');
  };

  const calculateTotalPrize = () => {
    const individualTotal = individualPrizes.reduce((total, prize) => total + prize.prize, 0);
    const groupTotal = groupPrizes
      .filter(group => group.active)
      .reduce((total, group) => total + (group.totalWinners * group.prizePerWinner), 0);
    return individualTotal + groupTotal;
  };

  const calculateTotalWinners = () => {
    const individualWinners = individualPrizes.length;
    const groupWinners = groupPrizes
      .filter(group => group.active)
      .reduce((total, group) => total + group.totalWinners, 0);
    return individualWinners + groupWinners;
  };

  return {
    individualPrizes,
    groupPrizes,
    editingRow,
    editingGroup,
    editIndividualValue,
    editGroupPrize,
    setEditIndividualValue,
    setEditGroupPrize,
    handleEditIndividual,
    handleSaveIndividual,
    handleEditGroup,
    handleSaveGroup,
    handleToggleGroup,
    handleCancel,
    calculateTotalPrize,
    calculateTotalWinners
  };
};

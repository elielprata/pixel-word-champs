
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { prizeService, PrizeConfiguration } from '@/services/prizeService';

interface IndividualPrize {
  position: number;
  prize: number;
  id: string;
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
  const [isLoading, setIsLoading] = useState(true);
  
  const [individualPrizes, setIndividualPrizes] = useState<IndividualPrize[]>([]);
  const [groupPrizes, setGroupPrizes] = useState<GroupPrize[]>([]);

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

  const handleSaveIndividual = async (position: number) => {
    const numericValue = parseInputValue(editIndividualValue);
    const prize = individualPrizes.find(p => p.position === position);
    
    if (!prize) return;

    const result = await prizeService.updatePrizeConfiguration(prize.id, {
      prize_amount: numericValue
    });

    if (result.success) {
      setIndividualPrizes(prev => 
        prev.map(p => 
          p.position === position 
            ? { ...p, prize: numericValue }
            : p
        )
      );
      setEditingRow(null);
      toast({
        title: "Premiação atualizada",
        description: `Configuração do ${position}º lugar foi atualizada.`,
      });
    } else {
      toast({
        title: "Erro ao atualizar",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleEditGroup = (groupId: string) => {
    const group = groupPrizes.find(g => g.id === groupId);
    if (group) {
      setEditGroupPrize(formatInputValue(group.prizePerWinner));
      setEditingGroup(groupId);
    }
  };

  const handleSaveGroup = async (groupId: string) => {
    const numericValue = parseInputValue(editGroupPrize);
    
    const result = await prizeService.updatePrizeConfiguration(groupId, {
      prize_amount: numericValue
    });

    if (result.success) {
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
    } else {
      toast({
        title: "Erro ao atualizar",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleToggleGroup = async (groupId: string) => {
    const group = groupPrizes.find(g => g.id === groupId);
    if (!group) return;

    const result = await prizeService.updatePrizeConfiguration(groupId, {
      active: !group.active
    });

    if (result.success) {
      setGroupPrizes(prev => 
        prev.map(g => 
          g.id === groupId 
            ? { ...g, active: !g.active }
            : g
        )
      );
    } else {
      toast({
        title: "Erro ao atualizar",
        description: result.error,
        variant: "destructive",
      });
    }
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
    isLoading,
    setEditIndividualValue,
    setEditGroupPrize,
    handleEditIndividual,
    handleSaveIndividual,
    handleEditGroup,
    handleSaveGroup,
    handleToggleGroup,
    handleCancel,
    calculateTotalPrize,
    calculateTotalWinners,
    refetch: loadPrizeConfigurations
  };
};

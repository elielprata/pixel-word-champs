
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

// Mock interfaces para manter compatibilidade
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
  const [individualPrizes, setIndividualPrizes] = useState<IndividualPrize[]>([]);
  const [groupPrizes, setGroupPrizes] = useState<GroupPrize[]>([]);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editIndividualValue, setEditIndividualValue] = useState<string>('');
  const [editGroupPrize, setEditGroupPrize] = useState<GroupPrize | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - sistema de premiação foi removido
  const fetchPrizeConfigurations = async () => {
    console.log('⚠️ Sistema de premiação foi removido - retornando dados vazios');
    setIndividualPrizes([]);
    setGroupPrizes([]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPrizeConfigurations();
  }, []);

  // Funções mock para manter compatibilidade
  const handleEditIndividual = (position: number) => {
    console.log('⚠️ Sistema de premiação foi removido');
  };

  const handleSaveIndividual = async (position: number) => {
    console.log('⚠️ Sistema de premiação foi removido');
  };

  const handleEditGroup = (group: GroupPrize) => {
    console.log('⚠️ Sistema de premiação foi removido');
  };

  const handleSaveGroup = async () => {
    console.log('⚠️ Sistema de premiação foi removido');
  };

  const handleToggleGroup = async (groupId: string) => {
    console.log('⚠️ Sistema de premiação foi removido');
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditingGroup(null);
    setEditGroupPrize(null);
    setEditIndividualValue('');
  };

  const calculateTotalPrize = () => {
    return 0; // Sistema removido
  };

  const calculateTotalWinners = () => {
    return 0; // Sistema removido
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
    refetch: fetchPrizeConfigurations
  };
};

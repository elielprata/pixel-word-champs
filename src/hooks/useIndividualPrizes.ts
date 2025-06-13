
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { prizeService } from '@/services/prizeService';
import { IndividualPrize } from '@/types/payment';

export const useIndividualPrizes = () => {
  const { toast } = useToast();
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editIndividualValue, setEditIndividualValue] = useState<string>('');

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

  const handleEditIndividual = (position: number, prizes: IndividualPrize[]) => {
    const prize = prizes.find(p => p.position === position);
    if (prize) {
      setEditIndividualValue(formatInputValue(prize.prize));
      setEditingRow(position);
    }
  };

  const handleSaveIndividual = async (
    position: number, 
    prizes: IndividualPrize[],
    onUpdate: (updatedPrizes: IndividualPrize[]) => void
  ) => {
    const numericValue = parseInputValue(editIndividualValue);
    const prize = prizes.find(p => p.position === position);
    
    if (!prize) return;

    const result = await prizeService.updatePrizeConfiguration(prize.id, {
      prize_amount: numericValue
    });

    if (result.success) {
      const updatedPrizes = prizes.map(p => 
        p.position === position 
          ? { ...p, prize: numericValue }
          : p
      );
      onUpdate(updatedPrizes);
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

  const handleCancel = () => {
    setEditingRow(null);
    setEditIndividualValue('');
  };

  return {
    editingRow,
    editIndividualValue,
    setEditIndividualValue,
    handleEditIndividual,
    handleSaveIndividual,
    handleCancel
  };
};

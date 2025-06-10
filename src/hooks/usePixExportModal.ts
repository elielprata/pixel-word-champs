
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface Winner {
  id: string;
  user_id: string;
  username: string;
  position: number;
  score: number;
  prize_amount: number;
  pix_key?: string;
  pix_holder_name?: string;
  payment_status: string;
}

export const usePixExportModal = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(false);
  const [rankingType, setRankingType] = useState<'weekly' | 'daily'>('weekly');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isFiltered, setIsFiltered] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const loadWinners = async () => {
    setLoading(true);
    try {
      console.log('⚠️ Sistema de premiação foi removido - carregando dados vazios');
      
      // Como o sistema de ranking complexo foi removido, retornamos uma lista vazia
      setWinners([]);
      
    } catch (error) {
      console.error('Erro ao carregar vencedores:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos vencedores",
        variant: "destructive",
      });
      setWinners([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    console.log('⚠️ Sistema de premiação foi removido - export não disponível');
    toast({
      title: "Aviso",
      description: "Sistema de premiação foi simplificado",
      variant: "default",
    });
  };

  const markAsPaid = async (winnerId: string) => {
    console.log('⚠️ Sistema de premiação foi removido');
    toast({
      title: "Aviso", 
      description: "Sistema de premiação foi simplificado",
      variant: "default",
    });
  };

  const markAsFailed = async (winnerId: string) => {
    console.log('⚠️ Sistema de premiação foi removido');
    toast({
      title: "Aviso",
      description: "Sistema de premiação foi simplificado", 
      variant: "default",
    });
  };

  const handleFilter = () => {
    setIsFiltered(true);
    loadWinners();
  };

  const handleMarkAsPaid = (winnerId: string) => {
    markAsPaid(winnerId);
  };

  const handleMarkAllAsPaid = () => {
    console.log('⚠️ Sistema de premiação foi removido');
    toast({
      title: "Aviso",
      description: "Sistema de premiação foi simplificado",
      variant: "default",
    });
  };

  const handleClearFilter = () => {
    setIsFiltered(false);
    setStartDate('');
    setEndDate('');
    loadWinners();
  };

  useEffect(() => {
    if (isOpen) {
      loadWinners();
    }
  }, [isOpen, rankingType, selectedWeek, selectedDay, paymentStatus]);

  return {
    isOpen,
    open,
    close,
    winners,
    loading,
    rankingType,
    setRankingType,
    selectedWeek,
    setSelectedWeek,
    selectedDay,
    setSelectedDay,
    paymentStatus,
    setPaymentStatus,
    exportToCSV,
    markAsPaid,
    markAsFailed,
    loadWinners,
    startDate,
    endDate,
    isFiltered,
    isLoading: loading,
    displayWinners: winners,
    setStartDate,
    setEndDate,
    handleFilter,
    handleMarkAsPaid,
    handleMarkAllAsPaid,
    handleClearFilter
  };
};

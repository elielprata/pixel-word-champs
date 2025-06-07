
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { paymentService, PaymentRecord } from '@/services/paymentService';

export const usePixExportModal = (open: boolean, prizeLevel: string) => {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredWinners, setFilteredWinners] = useState<PaymentRecord[]>([]);
  const [allWinners, setAllWinners] = useState<PaymentRecord[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadWinners();
    }
  }, [open, prizeLevel]);

  const loadWinners = async () => {
    setIsLoading(true);
    try {
      const winners = await paymentService.getWinnersForPrizeLevel(prizeLevel);
      setAllWinners(winners);
      setFilteredWinners([]);
      setIsFiltered(false);
    } catch (error) {
      console.error('Error loading winners:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os ganhadores.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Datas obrigatórias",
        description: "Selecione as datas de início e fim para filtrar.",
        variant: "destructive",
      });
      return;
    }

    const filtered = allWinners.filter(winner => {
      const consolidatedDate = new Date(winner.created_at);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return consolidatedDate >= start && consolidatedDate <= end;
    });

    setFilteredWinners(filtered);
    setIsFiltered(true);

    toast({
      title: "Filtro aplicado",
      description: `${filtered.length} ganhadores encontrados no período selecionado.`,
    });
  };

  const handleMarkAsPaid = async (winnerId: string) => {
    try {
      const result = await paymentService.markAsPaid(winnerId);
      
      if (result.success) {
        const updateWinners = (winners: PaymentRecord[]) =>
          winners.map(winner => 
            winner.id === winnerId 
              ? { ...winner, payment_status: 'paid', payment_date: new Date().toISOString() }
              : winner
          );

        setAllWinners(updateWinners);
        if (isFiltered) {
          setFilteredWinners(updateWinners);
        }

        toast({
          title: "Pagamento confirmado",
          description: "O pagamento foi marcado como realizado.",
        });
      } else {
        toast({
          title: "Erro ao confirmar pagamento",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao confirmar pagamento",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsPaid = async () => {
    const winnersToUpdate = isFiltered ? filteredWinners : allWinners;
    const pendingWinners = winnersToUpdate.filter(w => w.payment_status === 'pending');

    if (pendingWinners.length === 0) {
      toast({
        title: "Todos já foram pagos",
        description: "Todos os ganhadores já foram marcados como pagos.",
        variant: "destructive",
      });
      return;
    }

    try {
      const promises = pendingWinners.map(winner => paymentService.markAsPaid(winner.id));
      await Promise.all(promises);

      const updateWinners = (winners: PaymentRecord[]) =>
        winners.map(winner => 
          pendingWinners.some(w => w.id === winner.id)
            ? { ...winner, payment_status: 'paid', payment_date: new Date().toISOString() }
            : winner
        );

      setAllWinners(updateWinners);
      if (isFiltered) {
        setFilteredWinners(updateWinners);
      }

      toast({
        title: "Pagamentos confirmados",
        description: `${pendingWinners.length} pagamentos foram marcados como realizados.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao confirmar pagamentos",
        description: "Ocorreu um erro ao processar os pagamentos.",
        variant: "destructive",
      });
    }
  };

  const handleClearFilter = () => {
    setFilteredWinners([]);
    setIsFiltered(false);
    setStartDate('');
    setEndDate('');
    
    toast({
      title: "Filtros limpos",
      description: "Todos os filtros foram removidos.",
    });
  };

  const displayWinners = isFiltered ? filteredWinners : allWinners;

  return {
    startDate,
    endDate,
    filteredWinners,
    allWinners,
    isFiltered,
    isLoading,
    displayWinners,
    setStartDate,
    setEndDate,
    handleFilter,
    handleMarkAsPaid,
    handleMarkAllAsPaid,
    handleClearFilter,
    loadWinners
  };
};

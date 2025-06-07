
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { paymentService, PaymentRecord } from '@/services/paymentService';
import { exportToCSV } from '@/utils/csvExport';
import { PixFilters } from './pix/PixFilters';
import { PaymentStatus } from './pix/PaymentStatus';
import { WinnersTable } from './pix/WinnersTable';

interface PixExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prizeLevel: string;
}

export const PixExportModal = ({ open, onOpenChange, prizeLevel }: PixExportModalProps) => {
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
        // Atualizar o estado local
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
      // Marcar todos como pagos no banco
      const promises = pendingWinners.map(winner => paymentService.markAsPaid(winner.id));
      await Promise.all(promises);

      // Atualizar estado local
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

  const handleExport = () => {
    const winnersToExport = isFiltered ? filteredWinners : allWinners;
    
    if (winnersToExport.length === 0) {
      toast({
        title: "Nenhum ganhador",
        description: "Não há ganhadores para exportar no período selecionado.",
        variant: "destructive",
      });
      return;
    }

    // Converter para formato esperado pelo exportToCSV
    const exportData = winnersToExport.map(winner => ({
      id: winner.id,
      username: winner.username || 'Usuário',
      position: winner.position || 0,
      pixKey: winner.pix_key || 'Não informado',
      holderName: winner.pix_holder_name || 'Não informado',
      consolidatedDate: winner.created_at,
      prize: winner.prize_amount,
      paymentStatus: winner.payment_status as 'pending' | 'paid' | 'cancelled'
    }));

    exportToCSV(exportData, prizeLevel);

    toast({
      title: "Exportação concluída",
      description: `${winnersToExport.length} chaves PIX exportadas com sucesso.`,
    });
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
  const pendingCount = displayWinners.filter(w => w.payment_status === 'pending').length;
  const paidCount = displayWinners.filter(w => w.payment_status === 'paid').length;

  // Converter para formato esperado pelo WinnersTable
  const tableWinners = displayWinners.map(winner => ({
    id: winner.id,
    username: winner.username || 'Usuário',
    position: winner.position || 0,
    pixKey: winner.pix_key || 'Não informado',
    holderName: winner.pix_holder_name || 'Não informado',
    consolidatedDate: winner.created_at,
    prize: winner.prize_amount,
    paymentStatus: winner.payment_status as 'pending' | 'paid' | 'cancelled'
  }));

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        handleClearFilter();
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[600px] overflow-y-auto p-3 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Download className="h-4 w-4" />
            Exportar PIX - {prizeLevel}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <PixFilters
            startDate={startDate}
            endDate={endDate}
            isFiltered={isFiltered}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onFilter={handleFilter}
            onClear={handleClearFilter}
          />

          <PaymentStatus
            pendingCount={pendingCount}
            paidCount={paidCount}
            onMarkAllAsPaid={handleMarkAllAsPaid}
          />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <p className="text-xs text-gray-600">
                {isFiltered ? 'Filtrados:' : 'Total:'} 
                <span className="font-bold ml-1">{displayWinners.length}</span>
              </p>
              {isFiltered && startDate && endDate && (
                <p className="text-xs text-blue-600">
                  {new Date(startDate).toLocaleDateString('pt-BR')} - {new Date(endDate).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
            <Button onClick={handleExport} disabled={displayWinners.length === 0} className="h-8 text-xs">
              <Download className="h-3 w-3 mr-1" />
              Exportar CSV
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando ganhadores...</p>
            </div>
          ) : (
            <WinnersTable
              winners={tableWinners}
              onMarkAsPaid={handleMarkAsPaid}
              prizeLevel={prizeLevel}
              isFiltered={isFiltered}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

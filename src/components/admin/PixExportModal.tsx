
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Winner } from '@/types/winner';
import { getWinnersForPrizeLevel } from '@/utils/prizeLevel';
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
  const [filteredWinners, setFilteredWinners] = useState<Winner[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);

  // Mock data - em produção viria da API
  const mockWinners: Winner[] = [
    { id: '1', username: 'jogador123', position: 1, pixKey: '123.456.789-00', holderName: 'João Silva', consolidatedDate: '2024-01-15', prize: 1000, paymentStatus: 'pending' },
    { id: '2', username: 'gamer456', position: 2, pixKey: 'joao@email.com', holderName: 'Maria Santos', consolidatedDate: '2024-01-16', prize: 500, paymentStatus: 'paid' },
    { id: '3', username: 'player789', position: 3, pixKey: '(11) 99999-9999', holderName: 'Pedro Costa', consolidatedDate: '2024-01-17', prize: 250, paymentStatus: 'pending' },
    { id: '4', username: 'winner001', position: 4, pixKey: '987.654.321-00', holderName: 'Ana Lima', consolidatedDate: '2024-01-14', prize: 100, paymentStatus: 'paid' },
    { id: '5', username: 'champion2024', position: 5, pixKey: 'ana@email.com', holderName: 'Carlos Pereira', consolidatedDate: '2024-01-18', prize: 100, paymentStatus: 'pending' },
    { id: '6', username: 'player2024', position: 8, pixKey: 'player@email.com', holderName: 'Luis Santos', consolidatedDate: '2024-01-19', prize: 50, paymentStatus: 'pending' },
    { id: '7', username: 'gamer2024', position: 15, pixKey: 'gamer@email.com', holderName: 'Ana Costa', consolidatedDate: '2024-01-20', prize: 25, paymentStatus: 'pending' },
  ];

  const [winners, setWinners] = useState<Winner[]>(() => getWinnersForPrizeLevel(mockWinners, prizeLevel));

  const handleFilter = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Datas obrigatórias",
        description: "Selecione as datas de início e fim para filtrar.",
        variant: "destructive",
      });
      return;
    }

    const filtered = winners.filter(winner => {
      const consolidatedDate = new Date(winner.consolidatedDate);
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

  const handleMarkAsPaid = (winnerId: string) => {
    setWinners(prev => 
      prev.map(winner => 
        winner.id === winnerId 
          ? { ...winner, paymentStatus: 'paid' as const }
          : winner
      )
    );

    if (isFiltered) {
      setFilteredWinners(prev => 
        prev.map(winner => 
          winner.id === winnerId 
            ? { ...winner, paymentStatus: 'paid' as const }
            : winner
        )
      );
    }

    toast({
      title: "Pagamento confirmado",
      description: "O pagamento foi marcado como realizado.",
    });
  };

  const handleMarkAllAsPaid = () => {
    const winnersToUpdate = isFiltered ? filteredWinners : winners;
    const pendingWinners = winnersToUpdate.filter(w => w.paymentStatus === 'pending');

    if (pendingWinners.length === 0) {
      toast({
        title: "Todos já foram pagos",
        description: "Todos os ganhadores já foram marcados como pagos.",
        variant: "destructive",
      });
      return;
    }

    setWinners(prev => 
      prev.map(winner => 
        winnersToUpdate.some(w => w.id === winner.id)
          ? { ...winner, paymentStatus: 'paid' as const }
          : winner
      )
    );

    if (isFiltered) {
      setFilteredWinners(prev => 
        prev.map(winner => ({ ...winner, paymentStatus: 'paid' as const }))
      );
    }

    toast({
      title: "Pagamentos confirmados",
      description: `${pendingWinners.length} pagamentos foram marcados como realizados.`,
    });
  };

  const handleExport = () => {
    const winnersToExport = isFiltered ? filteredWinners : winners;
    
    if (winnersToExport.length === 0) {
      toast({
        title: "Nenhum ganhador",
        description: "Não há ganhadores para exportar no período selecionado.",
        variant: "destructive",
      });
      return;
    }

    exportToCSV(winnersToExport, prizeLevel);

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

  const displayWinners = isFiltered ? filteredWinners : winners;
  const pendingCount = displayWinners.filter(w => w.paymentStatus === 'pending').length;
  const paidCount = displayWinners.filter(w => w.paymentStatus === 'paid').length;

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
              {isFiltered && (
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

          <WinnersTable
            winners={displayWinners}
            onMarkAsPaid={handleMarkAsPaid}
            prizeLevel={prizeLevel}
            isFiltered={isFiltered}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

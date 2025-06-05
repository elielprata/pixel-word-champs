
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Download, Filter, CheckCircle, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PixExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prizeLevel: string;
}

interface Winner {
  id: string;
  username: string;
  position: number;
  pixKey: string;
  holderName: string;
  consolidatedDate: string;
  prize: number;
  paymentStatus: 'pending' | 'paid';
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

  // Função para determinar as posições válidas para cada nível de premiação
  const getValidPositions = (level: string): number[] => {
    switch (level) {
      case '1º Lugar':
        return [1];
      case 'Top 3':
        return [1, 2, 3];
      case 'Top 5':
        return [1, 2, 3, 4, 5];
      case 'Top 10':
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      case 'Top 20':
        return Array.from({ length: 20 }, (_, i) => i + 1);
      default:
        return [];
    }
  };

  // Filtrar ganhadores baseado no nível de premiação
  const getWinnersForPrizeLevel = (winners: Winner[], level: string): Winner[] => {
    const validPositions = getValidPositions(level);
    return winners.filter(winner => validPositions.includes(winner.position));
  };

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

    // Criar CSV
    const headers = ['Posição', 'Usuário', 'Chave PIX', 'Nome do Titular', 'Data Consolidada', 'Prêmio', 'Status Pagamento'];
    const csvContent = [
      headers.join(','),
      ...winnersToExport.map(winner => [
        winner.position,
        winner.username,
        `"${winner.pixKey}"`,
        `"${winner.holderName}"`,
        winner.consolidatedDate,
        `R$ ${winner.prize.toLocaleString('pt-BR')}`,
        winner.paymentStatus === 'paid' ? 'Pago' : 'Pendente'
      ].join(','))
    ].join('\n');

    // Download do arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pix_${prizeLevel.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

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
        // Limpar estado quando fechar o modal
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
          {/* Filtros */}
          <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
            <h3 className="font-medium mb-2 flex items-center gap-2 text-sm">
              <Filter className="h-3 w-3" />
              Filtrar por Data
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <Label htmlFor="startDate" className="text-xs">Início</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-xs">Fim</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="flex items-end gap-1">
                <Button onClick={handleFilter} className="flex-1 h-8 text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  Filtrar
                </Button>
                {isFiltered && (
                  <Button variant="outline" onClick={handleClearFilter} className="h-8 px-2 text-xs">
                    Limpar
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Status dos Pagamentos */}
          <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
              <h3 className="font-medium text-sm">Status dos Pagamentos</h3>
              <Button 
                onClick={handleMarkAllAsPaid} 
                disabled={pendingCount === 0}
                className="h-8 text-xs"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Marcar Todos como Pagos
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-xs">Pendentes: <strong>{pendingCount}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-xs">Pagos: <strong>{paidCount}</strong></span>
              </div>
            </div>
          </div>

          {/* Resumo */}
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

          {/* Tabela de Ganhadores */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs p-2">Pos.</TableHead>
                    <TableHead className="text-xs p-2">Usuário</TableHead>
                    <TableHead className="text-xs p-2 hidden sm:table-cell">Chave PIX</TableHead>
                    <TableHead className="text-xs p-2 hidden md:table-cell">Titular</TableHead>
                    <TableHead className="text-xs p-2 hidden lg:table-cell">Data</TableHead>
                    <TableHead className="text-xs p-2 text-right">Prêmio</TableHead>
                    <TableHead className="text-xs p-2 text-center">Status</TableHead>
                    <TableHead className="text-xs p-2 text-center">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayWinners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500 py-4 text-xs">
                        {isFiltered ? 'Nenhum ganhador no período.' : `Nenhum ganhador encontrado para ${prizeLevel}.`}
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayWinners.map((winner) => (
                      <TableRow key={winner.id}>
                        <TableCell className="font-medium text-xs p-2">{winner.position}º</TableCell>
                        <TableCell className="text-xs p-2">{winner.username}</TableCell>
                        <TableCell className="font-mono text-xs p-2 hidden sm:table-cell">
                          <div className="truncate max-w-[100px]" title={winner.pixKey}>
                            {winner.pixKey}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs p-2 hidden md:table-cell">
                          <div className="truncate max-w-[80px]" title={winner.holderName}>
                            {winner.holderName}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs p-2 hidden lg:table-cell">
                          {new Date(winner.consolidatedDate).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600 text-xs p-2">
                          R$ {winner.prize.toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-center text-xs p-2">
                          {winner.paymentStatus === 'paid' ? (
                            <div className="flex items-center justify-center gap-1 text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              <span>Pago</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1 text-orange-600">
                              <Clock className="h-3 w-3" />
                              <span>Pendente</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-xs p-2">
                          {winner.paymentStatus === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkAsPaid(winner.id)}
                              className="h-6 px-2 text-xs"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Pagar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

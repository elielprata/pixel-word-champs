
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Download, Filter } from 'lucide-react';
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
}

export const PixExportModal = ({ open, onOpenChange, prizeLevel }: PixExportModalProps) => {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredWinners, setFilteredWinners] = useState<Winner[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);

  // Mock data - em produção viria da API
  const mockWinners: Winner[] = [
    { id: '1', username: 'jogador123', position: 1, pixKey: '123.456.789-00', holderName: 'João Silva', consolidatedDate: '2024-01-15', prize: 1000 },
    { id: '2', username: 'gamer456', position: 2, pixKey: 'joao@email.com', holderName: 'Maria Santos', consolidatedDate: '2024-01-16', prize: 500 },
    { id: '3', username: 'player789', position: 3, pixKey: '(11) 99999-9999', holderName: 'Pedro Costa', consolidatedDate: '2024-01-17', prize: 250 },
    { id: '4', username: 'winner001', position: 4, pixKey: '987.654.321-00', holderName: 'Ana Lima', consolidatedDate: '2024-01-14', prize: 100 },
    { id: '5', username: 'champion2024', position: 5, pixKey: 'ana@email.com', holderName: 'Carlos Pereira', consolidatedDate: '2024-01-18', prize: 100 },
  ];

  const handleFilter = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Datas obrigatórias",
        description: "Selecione as datas de início e fim para filtrar.",
        variant: "destructive",
      });
      return;
    }

    const filtered = mockWinners.filter(winner => {
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

  const handleExport = () => {
    const winners = isFiltered ? filteredWinners : mockWinners;
    
    if (winners.length === 0) {
      toast({
        title: "Nenhum ganhador",
        description: "Não há ganhadores para exportar no período selecionado.",
        variant: "destructive",
      });
      return;
    }

    // Criar CSV
    const headers = ['Posição', 'Usuário', 'Chave PIX', 'Nome do Titular', 'Data Consolidada', 'Prêmio'];
    const csvContent = [
      headers.join(','),
      ...winners.map(winner => [
        winner.position,
        winner.username,
        `"${winner.pixKey}"`,
        `"${winner.holderName}"`,
        winner.consolidatedDate,
        `R$ ${winner.prize.toLocaleString('pt-BR')}`
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
      description: `${winners.length} chaves PIX exportadas com sucesso.`,
    });
  };

  const handleClearFilter = () => {
    setFilteredWinners([]);
    setIsFiltered(false);
    setStartDate('');
    setEndDate('');
  };

  const displayWinners = isFiltered ? filteredWinners : mockWinners;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar PIX - {prizeLevel}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filtros */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtrar por Data Consolidada
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="startDate">Data Início</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="endDate">Data Fim</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleFilter} className="flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                {isFiltered && (
                  <Button variant="outline" onClick={handleClearFilter}>
                    Limpar
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Resumo */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                {isFiltered ? 'Ganhadores filtrados:' : 'Total de ganhadores:'} 
                <span className="font-bold ml-1">{displayWinners.length}</span>
              </p>
              {isFiltered && (
                <p className="text-xs text-blue-600">
                  Período: {new Date(startDate).toLocaleDateString('pt-BR')} até {new Date(endDate).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
            <Button onClick={handleExport} disabled={displayWinners.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>

          {/* Tabela de Ganhadores */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Posição</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Chave PIX</TableHead>
                  <TableHead>Nome do Titular</TableHead>
                  <TableHead>Data Consolidada</TableHead>
                  <TableHead className="text-right">Prêmio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayWinners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      {isFiltered ? 'Nenhum ganhador encontrado no período selecionado.' : 'Nenhum ganhador encontrado.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayWinners.map((winner) => (
                    <TableRow key={winner.id}>
                      <TableCell className="font-medium">{winner.position}º</TableCell>
                      <TableCell>{winner.username}</TableCell>
                      <TableCell className="font-mono text-sm">{winner.pixKey}</TableCell>
                      <TableCell>{winner.holderName}</TableCell>
                      <TableCell>{new Date(winner.consolidatedDate).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        R$ {winner.prize.toLocaleString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

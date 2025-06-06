
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DollarSign, Edit, Save, X, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { PixExportModal } from "./PixExportModal";

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

const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const PaymentsTab = () => {
  const { toast } = useToast();
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedPrizeLevel, setSelectedPrizeLevel] = useState<string>('');
  
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

  const [editIndividualValue, setEditIndividualValue] = useState<string>('');
  const [editGroupPrize, setEditGroupPrize] = useState<string>('');

  const parseInputValue = (value: string): number => {
    // Remove R$, espaços e converte vírgula para ponto
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

  const handleExportPix = (prizeLevel: string) => {
    setSelectedPrizeLevel(prizeLevel);
    setExportModalOpen(true);
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

  const totalPrize = calculateTotalPrize();
  const totalWinners = calculateTotalWinners();

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Sistema de Premiação</h2>
        <div className="text-right">
          <p className="text-xs text-gray-600">Total de Premiação</p>
          <p className="text-lg font-bold text-green-600">{formatCurrency(totalPrize)}</p>
        </div>
      </div>
      
      {/* Prêmios Individuais */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4" />
              Premiação Individual (1º ao 3º)
            </CardTitle>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleExportPix('1º ao 3º lugar')}
              className="h-6 px-2 text-xs"
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold text-xs">Colocação</th>
                  <th className="text-left p-2 font-semibold text-xs">Premiação</th>
                  <th className="text-left p-2 font-semibold text-xs">Ações</th>
                </tr>
              </thead>
              <tbody>
                {individualPrizes.map((prize) => (
                  <tr key={prize.position} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium text-sm">{prize.position}º lugar</td>
                    <td className="p-2 text-sm">
                      {editingRow === prize.position ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs">R$</span>
                          <Input
                            type="text"
                            value={editIndividualValue}
                            onChange={(e) => setEditIndividualValue(e.target.value)}
                            className="w-20 h-7 text-xs"
                            placeholder="0,00"
                          />
                        </div>
                      ) : (
                        formatCurrency(prize.prize)
                      )}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        {editingRow === prize.position ? (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleSaveIndividual(prize.position)}
                              className="h-6 w-6 p-0"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={handleCancel}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditIndividual(prize.position)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Prêmios por Grupo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4" />
            Premiação por Grupos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-3">
            {groupPrizes.map((group) => (
              <div key={group.id} className={`border rounded-lg p-3 ${!group.active ? 'opacity-50 bg-gray-50' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={group.active}
                      onCheckedChange={() => handleToggleGroup(group.id)}
                    />
                    <span className="font-medium text-sm">{group.name}</span>
                    <span className="text-xs text-gray-500">({group.totalWinners} ganhadores)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingGroup === group.id ? (
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          onClick={() => handleSaveGroup(group.id)}
                          className="h-6 w-6 p-0"
                          disabled={!group.active}
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleCancel}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditGroup(group.id)}
                          className="h-6 w-6 p-0"
                          disabled={!group.active}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleExportPix(group.name)}
                          className="h-6 w-6 p-0"
                          disabled={!group.active}
                          title="Exportar PIX"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Prêmio individual:</span>
                    {editingGroup === group.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs">R$</span>
                        <Input
                          type="text"
                          value={editGroupPrize}
                          onChange={(e) => setEditGroupPrize(e.target.value)}
                          className="w-20 h-6 text-xs"
                          disabled={!group.active}
                          placeholder="0,00"
                        />
                      </div>
                    ) : (
                      <span className="text-sm font-medium">{formatCurrency(group.prizePerWinner)}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-600">Total do grupo:</span>
                    <div className="font-semibold text-green-600 text-sm">
                      {group.active ? formatCurrency(group.totalWinners * group.prizePerWinner) : 'R$ 0,00'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Resumo da Premiação</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600">Total de Ganhadores</p>
              <p className="text-lg font-bold text-blue-600">{totalWinners}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600">Valor Total de Prêmios</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(totalPrize)}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-600">Maior Prêmio Individual</p>
              <p className="text-lg font-bold text-purple-600">
                {formatCurrency(Math.max(...individualPrizes.map(p => p.prize)))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <PixExportModal 
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        prizeLevel={selectedPrizeLevel}
      />
    </div>
  );
};

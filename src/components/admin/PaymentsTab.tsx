import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Edit, Save, X, Download, Trophy, Users, Target, TrendingUp, Settings } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header com título e estatísticas principais */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Sistema de Premiação</h1>
              <p className="text-emerald-100 text-sm">Configure e gerencie os prêmios dos rankings</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 rounded-lg p-3 text-center min-w-[120px]">
              <div className="text-2xl font-bold">{formatCurrency(totalPrize)}</div>
              <div className="text-xs text-emerald-100">Total em Prêmios</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center min-w-[120px]">
              <div className="text-2xl font-bold">{totalWinners}</div>
              <div className="text-xs text-emerald-100">Total de Ganhadores</div>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Pódio (1º-3º)</p>
                <p className="text-lg font-bold text-blue-700">
                  {formatCurrency(individualPrizes.reduce((total, prize) => total + prize.prize, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Grupos Ativos</p>
                <p className="text-lg font-bold text-purple-700">
                  {groupPrizes.filter(g => g.active).length} / {groupPrizes.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <TrendingUp className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-amber-600 font-medium">Maior Prêmio</p>
                <p className="text-lg font-bold text-amber-700">
                  {formatCurrency(Math.max(...individualPrizes.map(p => p.prize)))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Prêmio Médio</p>
                <p className="text-lg font-bold text-green-700">
                  {formatCurrency(totalPrize / totalWinners)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prêmios Individuais */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-800">Premiação do Pódio</CardTitle>
                <p className="text-sm text-slate-600">Configure os prêmios para as 3 primeiras colocações</p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleExportPix('1º ao 3º lugar')}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar PIX
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4">
            {individualPrizes.map((prize) => (
              <div key={prize.position} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    prize.position === 1 ? 'bg-yellow-100 text-yellow-800' :
                    prize.position === 2 ? 'bg-gray-100 text-gray-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {prize.position}º
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{prize.position}º Lugar</p>
                    <p className="text-sm text-slate-600">Primeiro colocado do ranking</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {editingRow === prize.position ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-slate-600">R$</span>
                        <Input
                          type="text"
                          value={editIndividualValue}
                          onChange={(e) => setEditIndividualValue(e.target.value)}
                          className="w-24 h-8 text-sm"
                          placeholder="0,00"
                        />
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleSaveIndividual(prize.position)}
                        className="h-8 w-8 p-0"
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleCancel}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-lg text-green-600">{formatCurrency(prize.prize)}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditIndividual(prize.position)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prêmios por Grupo */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-800">Premiação por Grupos</CardTitle>
              <p className="text-sm text-slate-600">Configure prêmios para faixas de posições</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4">
            {groupPrizes.map((group) => (
              <div key={group.id} className={`p-4 rounded-lg border-2 transition-all ${
                group.active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'
              }`}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={group.active}
                        onCheckedChange={() => handleToggleGroup(group.id)}
                      />
                      <div>
                        <p className="font-semibold text-slate-800">{group.name}</p>
                        <p className="text-sm text-slate-600">{group.totalWinners} ganhadores</p>
                      </div>
                    </div>
                    <Badge variant={group.active ? "default" : "secondary"} className="text-xs">
                      {group.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Prêmio Individual</p>
                        {editingGroup === group.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs">R$</span>
                            <Input
                              type="text"
                              value={editGroupPrize}
                              onChange={(e) => setEditGroupPrize(e.target.value)}
                              className="w-20 h-7 text-xs"
                              disabled={!group.active}
                              placeholder="0,00"
                            />
                          </div>
                        ) : (
                          <p className="font-bold text-slate-800">{formatCurrency(group.prizePerWinner)}</p>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Total do Grupo</p>
                        <p className="font-bold text-green-600">
                          {group.active ? formatCurrency(group.totalWinners * group.prizePerWinner) : 'R$ 0,00'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {editingGroup === group.id ? (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleSaveGroup(group.id)}
                            className="h-8 w-8 p-0"
                            disabled={!group.active}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={handleCancel}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditGroup(group.id)}
                            className="h-8 w-8 p-0"
                            disabled={!group.active}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleExportPix(group.name)}
                            className="h-8 w-8 p-0 border-blue-200 text-blue-700 hover:bg-blue-50"
                            disabled={!group.active}
                            title="Exportar PIX"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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

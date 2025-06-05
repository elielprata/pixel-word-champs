
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Edit, Save, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface PrizeConfig {
  position: number;
  winners: number;
  prize: number;
}

export const PaymentsTab = () => {
  const { toast } = useToast();
  const [editingRow, setEditingRow] = useState<number | null>(null);
  
  const [prizeConfigs, setPrizeConfigs] = useState<PrizeConfig[]>([
    { position: 1, winners: 1, prize: 1000 },
    { position: 2, winners: 1, prize: 500 },
    { position: 3, winners: 1, prize: 250 },
    { position: 4, winners: 2, prize: 100 },
    { position: 5, winners: 2, prize: 75 },
    { position: 6, winners: 2, prize: 50 },
    { position: 7, winners: 2, prize: 40 },
    { position: 8, winners: 2, prize: 30 },
    { position: 9, winners: 2, prize: 20 },
    { position: 10, winners: 2, prize: 10 }
  ]);

  const [editValues, setEditValues] = useState<{ winners: number; prize: number }>({
    winners: 0,
    prize: 0
  });

  const handleEdit = (position: number) => {
    const config = prizeConfigs.find(p => p.position === position);
    if (config) {
      setEditValues({ winners: config.winners, prize: config.prize });
      setEditingRow(position);
    }
  };

  const handleSave = (position: number) => {
    setPrizeConfigs(prev => 
      prev.map(config => 
        config.position === position 
          ? { ...config, winners: editValues.winners, prize: editValues.prize }
          : config
      )
    );
    setEditingRow(null);
    toast({
      title: "Premiação atualizada",
      description: `Configuração da ${position}ª colocação foi atualizada.`,
    });
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditValues({ winners: 0, prize: 0 });
  };

  const totalPrize = prizeConfigs.reduce((total, config) => total + (config.winners * config.prize), 0);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Sistema de Premiação</h2>
        <div className="text-right">
          <p className="text-xs text-gray-600">Total de Premiação</p>
          <p className="text-lg font-bold text-green-600">R$ {totalPrize.toLocaleString('pt-BR')}</p>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-4 w-4" />
            Configuração de Premiação por Colocação
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold text-xs">Colocação</th>
                  <th className="text-left p-2 font-semibold text-xs">Ganhadores</th>
                  <th className="text-left p-2 font-semibold text-xs">Premiação Individual</th>
                  <th className="text-left p-2 font-semibold text-xs">Total da Colocação</th>
                  <th className="text-left p-2 font-semibold text-xs">Ações</th>
                </tr>
              </thead>
              <tbody>
                {prizeConfigs.map((config) => (
                  <tr key={config.position} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium text-sm">{config.position}º lugar</td>
                    <td className="p-2 text-sm">
                      {editingRow === config.position ? (
                        <Input
                          type="number"
                          min="1"
                          value={editValues.winners}
                          onChange={(e) => setEditValues(prev => ({ ...prev, winners: parseInt(e.target.value) || 0 }))}
                          className="w-16 h-7 text-xs"
                        />
                      ) : (
                        `${config.winners} ${config.winners === 1 ? 'ganhador' : 'ganhadores'}`
                      )}
                    </td>
                    <td className="p-2 text-sm">
                      {editingRow === config.position ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs">R$</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editValues.prize}
                            onChange={(e) => setEditValues(prev => ({ ...prev, prize: parseFloat(e.target.value) || 0 }))}
                            className="w-20 h-7 text-xs"
                          />
                        </div>
                      ) : (
                        `R$ ${config.prize.toLocaleString('pt-BR')}`
                      )}
                    </td>
                    <td className="p-2 font-semibold text-green-600 text-sm">
                      R$ {(config.winners * config.prize).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-2">
                      {editingRow === config.position ? (
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            onClick={() => handleSave(config.position)}
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
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(config.position)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Resumo da Premiação</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600">Total de Ganhadores</p>
              <p className="text-lg font-bold text-blue-600">
                {prizeConfigs.reduce((total, config) => total + config.winners, 0)}
              </p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600">Valor Total de Prêmios</p>
              <p className="text-lg font-bold text-green-600">
                R$ {totalPrize.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-600">Maior Prêmio Individual</p>
              <p className="text-lg font-bold text-purple-600">
                R$ {Math.max(...prizeConfigs.map(c => c.prize)).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sistema de Premiação</h2>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total de Premiação</p>
          <p className="text-2xl font-bold text-green-600">R$ {totalPrize.toLocaleString('pt-BR')}</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Configuração de Premiação por Colocação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Colocação</th>
                  <th className="text-left p-3 font-semibold">Ganhadores</th>
                  <th className="text-left p-3 font-semibold">Premiação Individual</th>
                  <th className="text-left p-3 font-semibold">Total da Colocação</th>
                  <th className="text-left p-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {prizeConfigs.map((config) => (
                  <tr key={config.position} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{config.position}º lugar</td>
                    <td className="p-3">
                      {editingRow === config.position ? (
                        <Input
                          type="number"
                          min="1"
                          value={editValues.winners}
                          onChange={(e) => setEditValues(prev => ({ ...prev, winners: parseInt(e.target.value) || 0 }))}
                          className="w-20"
                        />
                      ) : (
                        `${config.winners} ${config.winners === 1 ? 'ganhador' : 'ganhadores'}`
                      )}
                    </td>
                    <td className="p-3">
                      {editingRow === config.position ? (
                        <div className="flex items-center gap-1">
                          <span>R$</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editValues.prize}
                            onChange={(e) => setEditValues(prev => ({ ...prev, prize: parseFloat(e.target.value) || 0 }))}
                            className="w-24"
                          />
                        </div>
                      ) : (
                        `R$ ${config.prize.toLocaleString('pt-BR')}`
                      )}
                    </td>
                    <td className="p-3 font-semibold text-green-600">
                      R$ {(config.winners * config.prize).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3">
                      {editingRow === config.position ? (
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            onClick={() => handleSave(config.position)}
                            className="h-8 w-8 p-0"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={handleCancel}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(config.position)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
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
        <CardHeader>
          <CardTitle>Resumo da Premiação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total de Ganhadores</p>
              <p className="text-2xl font-bold text-blue-600">
                {prizeConfigs.reduce((total, config) => total + config.winners, 0)}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Valor Total de Prêmios</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {totalPrize.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Maior Prêmio Individual</p>
              <p className="text-2xl font-bold text-purple-600">
                R$ {Math.max(...prizeConfigs.map(c => c.prize)).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

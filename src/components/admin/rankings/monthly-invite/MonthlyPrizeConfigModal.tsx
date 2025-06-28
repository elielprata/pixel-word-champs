
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Trash, Plus, Edit, DollarSign } from 'lucide-react';
import { useMonthlyInvitePrizes } from '@/hooks/useMonthlyInvitePrizes';
import { MonthlyInvitePrize } from '@/services/monthlyInvite/monthlyInvitePrizes';

interface MonthlyPrizeConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competitionId?: string;
}

export const MonthlyPrizeConfigModal = ({ open, onOpenChange, competitionId }: MonthlyPrizeConfigModalProps) => {
  const { prizes, isLoading, updatePrize, createPrize, deletePrize, togglePrizeStatus, calculateTotalPrizePool } = useMonthlyInvitePrizes(competitionId);
  
  const [editingPrize, setEditingPrize] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<MonthlyInvitePrize>>({});
  
  const [newPrize, setNewPrize] = useState({
    position: '',
    prize_amount: '',
    description: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleEdit = (prize: MonthlyInvitePrize) => {
    setEditingPrize(prize.id);
    setEditValues({
      position: prize.position,
      prize_amount: prize.prize_amount,
      description: prize.description || ''
    });
  };

  const handleSave = async () => {
    if (!editingPrize) return;
    
    const success = await updatePrize(editingPrize, editValues);
    if (success) {
      setEditingPrize(null);
      setEditValues({});
    }
  };

  const handleCancel = () => {
    setEditingPrize(null);
    setEditValues({});
  };

  const handleCreate = async () => {
    if (!newPrize.position || !newPrize.prize_amount) return;
    
    const success = await createPrize(
      parseInt(newPrize.position),
      parseFloat(newPrize.prize_amount),
      newPrize.description || undefined
    );
    
    if (success) {
      setNewPrize({ position: '', prize_amount: '', description: '' });
      setShowAddForm(false);
    }
  };

  const handleDelete = async (prizeId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este prêmio?')) {
      await deletePrize(prizeId);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configuração de Prêmios - Competição Mensal</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Configuração de Prêmios - Competição Mensal
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo da Premiação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total de Prêmios</p>
                  <p className="text-2xl font-bold">{prizes.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pool Total de Prêmios</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {calculateTotalPrizePool().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add New Prize */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Adicionar Novo Prêmio</span>
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Prêmio
                </Button>
              </CardTitle>
            </CardHeader>
            {showAddForm && (
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="new-position">Posição</Label>
                    <Input
                      id="new-position"
                      type="number"
                      value={newPrize.position}
                      onChange={(e) => setNewPrize(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="Ex: 1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-amount">Valor do Prêmio (R$)</Label>
                    <Input
                      id="new-amount"
                      type="number"
                      step="0.01"
                      value={newPrize.prize_amount}
                      onChange={(e) => setNewPrize(prev => ({ ...prev, prize_amount: e.target.value }))}
                      placeholder="Ex: 500.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-description">Descrição (opcional)</Label>
                    <Input
                      id="new-description"
                      value={newPrize.description}
                      onChange={(e) => setNewPrize(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Ex: Primeiro lugar"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleCreate} disabled={!newPrize.position || !newPrize.prize_amount}>
                    Adicionar Prêmio
                  </Button>
                  <Button onClick={() => setShowAddForm(false)} variant="outline">
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Prizes List */}
          <Card>
            <CardHeader>
              <CardTitle>Prêmios Configurados</CardTitle>
            </CardHeader>
            <CardContent>
              {prizes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum prêmio configurado ainda</p>
                  <p className="text-sm">Use o botão "Novo Prêmio" para adicionar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {prizes.map((prize) => (
                    <div key={prize.id} className="border rounded-lg p-4">
                      {editingPrize === prize.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>Posição</Label>
                              <Input
                                type="number"
                                value={editValues.position || ''}
                                onChange={(e) => setEditValues(prev => ({ ...prev, position: parseInt(e.target.value) }))}
                              />
                            </div>
                            <div>
                              <Label>Valor do Prêmio (R$)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={editValues.prize_amount || ''}
                                onChange={(e) => setEditValues(prev => ({ ...prev, prize_amount: parseFloat(e.target.value) }))}
                              />
                            </div>
                            <div>
                              <Label>Descrição</Label>
                              <Input
                                value={editValues.description || ''}
                                onChange={(e) => setEditValues(prev => ({ ...prev, description: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleSave} size="sm">
                              Salvar
                            </Button>
                            <Button onClick={handleCancel} variant="outline" size="sm">
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className="text-lg px-3 py-1">
                              {prize.position}º
                            </Badge>
                            <div>
                              <p className="font-semibold text-green-600">
                                R$ {Number(prize.prize_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                              {prize.description && (
                                <p className="text-sm text-gray-600">{prize.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={prize.active}
                                onCheckedChange={(checked) => togglePrizeStatus(prize.id, checked)}
                              />
                              <span className="text-sm">
                                {prize.active ? 'Ativo' : 'Inativo'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEdit(prize)}
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(prize.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

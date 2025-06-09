
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Users, Edit, Save, X, Download } from 'lucide-react';
import { GroupPrize } from '@/types/payment';

interface GroupPrizesSectionProps {
  groupPrizes: GroupPrize[];
  editingGroup: string | null;
  editGroupPrize: GroupPrize | null;
  setEditGroupPrize: (value: GroupPrize | null) => void;
  onEditGroup: (group: GroupPrize) => void;
  onSaveGroup: () => void;
  onToggleGroup: (groupId: string) => void;
  onCancel: () => void;
  onExportPix: (prizeLevel: string) => void;
}

const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const GroupPrizesSection = ({
  groupPrizes,
  editingGroup,
  editGroupPrize,
  setEditGroupPrize,
  onEditGroup,
  onSaveGroup,
  onToggleGroup,
  onCancel,
  onExportPix
}: GroupPrizesSectionProps) => {
  return (
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
                      onCheckedChange={() => onToggleGroup(group.id)}
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
                      {editingGroup === group.id && editGroupPrize ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs">R$</span>
                          <Input
                            type="number"
                            value={editGroupPrize.prizePerWinner}
                            onChange={(e) => setEditGroupPrize({
                              ...editGroupPrize,
                              prizePerWinner: Number(e.target.value) || 0
                            })}
                            className="w-20 h-7 text-xs"
                            disabled={!group.active}
                            placeholder="0"
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
                          onClick={onSaveGroup}
                          className="h-8 w-8 p-0"
                          disabled={!group.active}
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={onCancel}
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
                          onClick={() => onEditGroup(group)}
                          className="h-8 w-8 p-0"
                          disabled={!group.active}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onExportPix(group.name)}
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
  );
};

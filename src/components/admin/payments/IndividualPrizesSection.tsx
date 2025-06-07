
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Download, Edit, Save, X } from 'lucide-react';

interface IndividualPrize {
  position: number;
  prize: number;
}

interface IndividualPrizesSectionProps {
  individualPrizes: IndividualPrize[];
  editingRow: number | null;
  editIndividualValue: string;
  setEditIndividualValue: (value: string) => void;
  onEditIndividual: (position: number) => void;
  onSaveIndividual: (position: number) => void;
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

export const IndividualPrizesSection = ({
  individualPrizes,
  editingRow,
  editIndividualValue,
  setEditIndividualValue,
  onEditIndividual,
  onSaveIndividual,
  onCancel,
  onExportPix
}: IndividualPrizesSectionProps) => {
  return (
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
            onClick={() => onExportPix('1º ao 3º lugar')}
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
                      onClick={() => onSaveIndividual(prize.position)}
                      className="h-8 w-8 p-0"
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
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-lg text-green-600">{formatCurrency(prize.prize)}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onEditIndividual(prize.position)}
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
  );
};

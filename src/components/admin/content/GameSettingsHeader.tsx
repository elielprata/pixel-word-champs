
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, Settings } from 'lucide-react';

interface GameSettingsHeaderProps {
  onSave: () => void;
  onReset: () => void;
  onSetAsDefaults: () => void;
  saving: boolean;
}

export const GameSettingsHeader = ({ onSave, onReset, onSetAsDefaults, saving }: GameSettingsHeaderProps) => {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg text-slate-800">Configurações do Jogo</CardTitle>
            <p className="text-sm text-slate-600">
              Ajuste pontuações e mecânicas do jogo. Para valores de premiação, acesse o menu "Premiação".
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onSetAsDefaults}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Definir como Padrão
            </Button>
            <Button
              variant="outline"
              onClick={onReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Restaurar Padrão
            </Button>
            <Button
              onClick={onSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar Tudo'}
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

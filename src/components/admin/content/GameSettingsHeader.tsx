
import React from 'react';
import { Button } from "@/components/ui/button";
import { Save } from 'lucide-react';

interface GameSettingsHeaderProps {
  onSave: () => void;
  saving: boolean;
}

export const GameSettingsHeader = ({ onSave, saving }: GameSettingsHeaderProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200">
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Configurações do Jogo</h2>
            <p className="text-sm text-slate-600">
              Ajuste pontuações e mecânicas do jogo. Para valores de premiação, acesse o menu "Premiação".
            </p>
          </div>
          <div className="flex gap-2">
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
      </div>
    </div>
  );
};

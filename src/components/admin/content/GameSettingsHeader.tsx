
import React from 'react';
import { Button } from "@/components/ui/button";
import { Save } from 'lucide-react';

interface GameSettingsHeaderProps {
  onSave: () => void;
  saving: boolean;
}

export const GameSettingsHeader = ({ onSave, saving }: GameSettingsHeaderProps) => {
  return (
    <div className="border-slate-200 shadow-sm rounded-lg border bg-white">
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200 p-6 rounded-t-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg text-slate-800 font-semibold">Configurações do Jogo</h3>
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


import React from 'react';
import { Badge } from "@/components/ui/badge";
import { GameSettingItem } from './GameSettingItem';

interface GameSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string;
  category: string;
}

interface GameSettingsCategoryProps {
  category: string;
  settings: GameSetting[];
  onUpdateSetting: (key: string, value: string) => void;
}

export const GameSettingsCategory = ({ 
  category, 
  settings, 
  onUpdateSetting 
}: GameSettingsCategoryProps) => {
  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'scoring': return 'Sistema de Pontuação';
      case 'gameplay': return 'Mecânicas do Jogo';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'scoring': return 'from-blue-50 to-cyan-50 border-blue-200';
      case 'gameplay': return 'from-green-50 to-emerald-50 border-green-200';
      default: return 'from-gray-50 to-slate-50 border-gray-200';
    }
  };

  return (
    <div className={`border-2 bg-gradient-to-br ${getCategoryColor(category)} rounded-lg shadow-md`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">
            {getCategoryTitle(category)}
          </h3>
          <Badge variant="outline" className="bg-white/50">
            {settings.length} configurações
          </Badge>
        </div>
      </div>
      <div className="p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settings.map((setting) => (
            <GameSettingItem
              key={setting.id}
              setting={setting}
              onUpdate={onUpdateSetting}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

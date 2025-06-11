
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GameSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string;
  category: string;
}

interface GameSettingItemProps {
  setting: GameSetting;
  onUpdate: (key: string, value: string) => void;
}

export const GameSettingItem = ({ setting, onUpdate }: GameSettingItemProps) => {
  return (
    <div className="bg-white/70 rounded-lg p-4 border border-white/50">
      <Label className="text-sm font-semibold text-slate-700 mb-2 block">
        {setting.description}
      </Label>
      <Input
        type={setting.setting_type === 'number' ? 'number' : 'text'}
        value={setting.setting_value}
        onChange={(e) => onUpdate(setting.setting_key, e.target.value)}
        className="bg-white border-slate-200"
        placeholder={`Valor para ${setting.setting_key}`}
      />
      <p className="text-xs text-slate-500 mt-1">
        Chave: {setting.setting_key}
      </p>
    </div>
  );
};

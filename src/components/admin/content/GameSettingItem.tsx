
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const renderInput = () => {
    // Configurações especiais que precisam de validação específica
    if (setting.setting_key.includes('word_length')) {
      return (
        <Select value={setting.setting_value} onValueChange={(value) => onUpdate(setting.setting_key, value)}>
          <SelectTrigger className="bg-white border-slate-200">
            <SelectValue placeholder="Selecione o tamanho" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 letras</SelectItem>
            <SelectItem value="4">4 letras</SelectItem>
            <SelectItem value="5">5 letras</SelectItem>
            <SelectItem value="6">6 letras</SelectItem>
            <SelectItem value="7">7 letras</SelectItem>
            <SelectItem value="8">8 letras</SelectItem>
            <SelectItem value="9">9 letras</SelectItem>
            <SelectItem value="10">10 letras</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    // Input padrão para outros tipos
    return (
      <Input
        type={setting.setting_type === 'number' ? 'number' : 'text'}
        value={setting.setting_value}
        onChange={(e) => onUpdate(setting.setting_key, e.target.value)}
        className="bg-white border-slate-200"
        placeholder={`Valor para ${setting.setting_key}`}
        min={setting.setting_type === 'number' ? 0 : undefined}
        step={setting.setting_type === 'number' ? 1 : undefined}
      />
    );
  };

  return (
    <div className="bg-white/70 rounded-lg p-4 border border-white/50">
      <Label className="text-sm font-semibold text-slate-700 mb-2 block">
        {setting.description}
      </Label>
      {renderInput()}
      <p className="text-xs text-slate-500 mt-1">
        Chave: {setting.setting_key}
      </p>
    </div>
  );
};

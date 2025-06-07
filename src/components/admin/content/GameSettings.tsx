
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useGameSettings } from "@/hooks/useGameSettings";
import { GameSettingsForm } from './GameSettingsForm';

export const GameSettings = () => {
  const {
    settings,
    loading,
    saving,
    updateSetting,
    saveSettings,
    resetToDefaults
  } = useGameSettings();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p>Carregando configurações...</p>
        </CardContent>
      </Card>
    );
  }

  const handleSaveSettings = async (updatedSettings: typeof settings) => {
    // Atualizar estado local primeiro
    updatedSettings.forEach(setting => {
      updateSetting(setting.setting_key, setting.setting_value);
    });
    
    // Salvar no banco
    await saveSettings();
  };

  return (
    <div className="space-y-6">
      <GameSettingsForm
        settings={settings}
        onSave={handleSaveSettings}
        onReset={resetToDefaults}
        saving={saving}
      />

      {settings.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <p>Nenhuma configuração encontrada</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

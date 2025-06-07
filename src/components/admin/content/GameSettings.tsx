
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useGameSettings } from "@/hooks/useGameSettings";
import { GameSettingsHeader } from './GameSettingsHeader';
import { GameSettingsCategory } from './GameSettingsCategory';

export const GameSettings = () => {
  const {
    settings,
    loading,
    saving,
    updateSetting,
    saveSettings
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

  const groupedSettings = settings.reduce((groups, setting) => {
    const category = setting.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(setting);
    return groups;
  }, {} as Record<string, typeof settings>);

  return (
    <div className="space-y-6">
      <GameSettingsHeader
        onSave={saveSettings}
        saving={saving}
      />

      {/* Configurações agrupadas por categoria */}
      {Object.entries(groupedSettings).map(([category, categorySettings]) => (
        <GameSettingsCategory
          key={category}
          category={category}
          settings={categorySettings}
          onUpdateSetting={updateSetting}
        />
      ))}

      {Object.keys(groupedSettings).length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <p>Nenhuma configuração encontrada</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

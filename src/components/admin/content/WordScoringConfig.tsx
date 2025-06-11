
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameSettingItem } from './GameSettingItem';
import { useGameSettings } from "@/hooks/useGameSettings";
import { Calculator } from 'lucide-react';

export const WordScoringConfig = () => {
  const { settings, loading, updateSetting } = useGameSettings();

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

  // Filtrar apenas configurações de pontuação
  const scoringSettings = settings.filter(setting => 
    setting.category === 'scoring' && setting.setting_key.startsWith('points_per_')
  );

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-gradient-to-r from-emerald-50 to-green-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-emerald-800 flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Sistema de Pontuação
          </CardTitle>
          <p className="text-emerald-600 text-sm">
            Configure os pontos atribuídos por tamanho de palavra
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scoringSettings.map((setting) => (
              <GameSettingItem
                key={setting.id}
                setting={setting}
                onUpdate={updateSetting}
              />
            ))}
          </div>
          
          {scoringSettings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma configuração de pontuação encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

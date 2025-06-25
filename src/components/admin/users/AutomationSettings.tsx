
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Clock, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AutomationLogs } from './AutomationLogs';
import { useAutomationSettings } from '@/hooks/useAutomationSettings';
import { AutomationConfig, AutomationSettingsProps } from './automation/types';
import { getDefaultSettings } from './automation/utils';
import { AutomationActions } from './automation/AutomationActions';
import { ManualTestSection } from './automation/ManualTestSection';

export const AutomationSettings = ({ onSaveSettings, currentSettings }: AutomationSettingsProps) => {
  const { logs, isExecuting, executeManualReset } = useAutomationSettings();
  const [settings, setSettings] = useState<AutomationConfig>(
    currentSettings || getDefaultSettings()
  );
  const [showTestSection, setShowTestSection] = useState(false);

  const handleSave = () => {
    onSaveSettings(settings);
  };

  const handleManualTest = async () => {
    const success = await executeManualReset();
    if (success) {
      setShowTestSection(false);
    }
  };

  return (
    <Tabs defaultValue="settings" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Configurações
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Histórico ({logs.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="settings" className="space-y-6 mt-6">
        <Card className="border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Settings className="h-5 w-5" />
              Automação de Reset Baseado em Tempo
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Switch de Automação */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="automation-enabled" className="text-base font-medium">
                  Automação Ativada
                </Label>
                <p className="text-sm text-slate-600">
                  Ativar reset automático de pontuações baseado nas datas do ranking semanal
                </p>
              </div>
              <Switch
                id="automation-enabled"
                checked={settings.enabled}
                onCheckedChange={(enabled) => setSettings({ ...settings, enabled })}
              />
            </div>

            {settings.enabled && (
              <>
                {/* Informação sobre o tipo de trigger */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Reset Baseado em Tempo</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    O sistema verifica diariamente às 00:00:00 se a data de fim do ranking semanal foi ultrapassada.
                    Quando isso acontece, executa automaticamente o reset das pontuações de todos os usuários.
                  </p>
                </div>

                {/* Alerta de aviso */}
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Atenção:</strong> O reset automático zeará a pontuação de todos os usuários.
                    Esta ação é irreversível e será executada automaticamente quando a data de fim do ranking semanal for ultrapassada.
                  </AlertDescription>
                </Alert>
              </>
            )}

            <AutomationActions
              settings={settings}
              showTestSection={showTestSection}
              onSave={handleSave}
              onToggleTestSection={() => setShowTestSection(!showTestSection)}
            />

            <ManualTestSection
              showTestSection={showTestSection}
              isExecuting={isExecuting}
              onExecuteTest={handleManualTest}
              onCancel={() => setShowTestSection(false)}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history" className="mt-6">
        <AutomationLogs logs={logs} />
      </TabsContent>
    </Tabs>
  );
};

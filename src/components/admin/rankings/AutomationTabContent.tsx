import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Clock, AlertTriangle, RotateCcw, Zap } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AutomationLogs } from '../users/AutomationLogs';
import { useAutomationSettings } from '@/hooks/useAutomationSettings';
import { useResetScores } from '@/hooks/useResetScores';
import { AutomationConfig } from '../users/automation/types';
import { getDefaultSettings } from '../users/automation/utils';
import { AutomationActions } from '../users/automation/AutomationActions';
import { ManualTestSection } from '../users/automation/ManualTestSection';

export const AutomationTabContent = () => {
  const { logs, isExecuting, executeManualReset, settings: currentSettings, saveSettings } = useAutomationSettings();
  const { resetAllScores, isResettingScores } = useResetScores();
  const [settings, setSettings] = useState<AutomationConfig>(
    currentSettings || getDefaultSettings()
  );
  const [showTestSection, setShowTestSection] = useState(false);
  const [showEmergencyReset, setShowEmergencyReset] = useState(false);

  const handleSave = () => {
    saveSettings(settings);
  };

  const handleManualTest = async () => {
    const success = await executeManualReset();
    if (success) {
      setShowTestSection(false);
    }
  };

  const handleEmergencyReset = async () => {
    try {
      await resetAllScores('admin123'); // Using the correct function name
      setShowEmergencyReset(false);
    } catch (error) {
      console.error('Erro no reset de emergência:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Reset Manual
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
                Automação de Reset por Finalização de Competição
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
                    Ativar reset automático de pontuações após finalização de competições semanais
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
                      <span className="font-medium">Reset por Finalização de Competição</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      O reset será executado automaticamente quando uma competição semanal for finalizada.
                      Isso zera as pontuações de todos os usuários para iniciar um novo ciclo de competição.
                    </p>
                  </div>

                  {/* Alerta de aviso */}
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Atenção:</strong> O reset automático zeará a pontuação de todos os usuários.
                      Esta ação é irreversível e será executada automaticamente quando uma competição semanal for finalizada.
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

        <TabsContent value="emergency" className="space-y-6 mt-6">
          <Card className="border-red-200">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Zap className="h-5 w-5" />
                Reset Manual de Emergência
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <p className="text-slate-700">
                  Use esta funcionalidade para zerar manualmente todas as pontuações dos usuários em situações de emergência.
                </p>

                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>ATENÇÃO:</strong> Esta ação é irreversível e zerará imediatamente a pontuação de todos os usuários do sistema.
                    Use apenas em casos de emergência ou manutenção programada.
                  </AlertDescription>
                </Alert>

                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowEmergencyReset(!showEmergencyReset)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {showEmergencyReset ? 'Cancelar' : 'Preparar Reset de Emergência'}
                  </Button>
                </div>

                {showEmergencyReset && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-800">Confirmar Reset de Emergência</h4>
                      <p className="text-sm text-red-700">
                        Esta ação zerará imediatamente a pontuação de todos os usuários. Tem certeza de que deseja continuar?
                      </p>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        variant="destructive"
                        onClick={handleEmergencyReset}
                        disabled={isResettingScores}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isResettingScores ? (
                          <>
                            <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                            Executando Reset...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            CONFIRMAR RESET DE EMERGÊNCIA
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => setShowEmergencyReset(false)}
                        disabled={isResettingScores}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <AutomationLogs logs={logs} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

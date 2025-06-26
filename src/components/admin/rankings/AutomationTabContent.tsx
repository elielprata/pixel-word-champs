
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Clock, Zap } from 'lucide-react';
import { useAutomationTabLogic } from './automation/useAutomationTabLogic';
import { AutomationSystemStatus } from './automation/AutomationSystemStatus';
import { AutomationSettingsSection } from './automation/AutomationSettingsSection';
import { EmergencyResetSection } from './automation/EmergencyResetSection';
import { AutomationHistorySection } from './automation/AutomationHistorySection';

export const AutomationTabContent = () => {
  const {
    logs,
    settings,
    showTestSection,
    showEmergencyReset,
    isExecuting,
    isResettingScores,
    setSettings,
    setShowTestSection,
    setShowEmergencyReset,
    handleSave,
    handleManualTest,
    handleEmergencyReset
  } = useAutomationTabLogic();

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
                Automação de Reset Sincronizada (Baseado em Tempo)
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <AutomationSystemStatus />

              <AutomationSettingsSection
                settings={settings}
                showTestSection={showTestSection}
                isExecuting={isExecuting}
                onSettingsChange={setSettings}
                onSave={handleSave}
                onToggleTestSection={() => setShowTestSection(!showTestSection)}
                onExecuteTest={handleManualTest}
                onCancelTest={() => setShowTestSection(false)}
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
              <EmergencyResetSection
                showEmergencyReset={showEmergencyReset}
                isResettingScores={isResettingScores}
                onToggleEmergencyReset={() => setShowEmergencyReset(!showEmergencyReset)}
                onEmergencyReset={handleEmergencyReset}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <AutomationHistorySection logs={logs} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

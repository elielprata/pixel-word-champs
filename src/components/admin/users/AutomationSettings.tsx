
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Clock } from 'lucide-react';
import { AutomationLogs } from './AutomationLogs';
import { useAutomationSettings } from '@/hooks/useAutomationSettings';
import { AutomationConfig, AutomationSettingsProps } from './automation/types';
import { getNextExecution, getDefaultSettings } from './automation/utils';
import { AutomationToggle } from './automation/AutomationToggle';
import { TriggerTypeSelector } from './automation/TriggerTypeSelector';
import { ScheduleConfiguration } from './automation/ScheduleConfiguration';
import { CompetitionFinalizationInfo } from './automation/CompetitionFinalizationInfo';
import { NextExecutionAlert } from './automation/NextExecutionAlert';
import { WarningAlert } from './automation/WarningAlert';
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

  const nextExecution = getNextExecution(settings);

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
              Automação de Reset de Pontuações
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            <AutomationToggle 
              settings={settings} 
              onSettingsChange={setSettings} 
            />

            {settings.enabled && (
              <>
                <div className="space-y-4">
                  <TriggerTypeSelector 
                    settings={settings} 
                    onSettingsChange={setSettings} 
                  />

                  <ScheduleConfiguration 
                    settings={settings} 
                    onSettingsChange={setSettings} 
                  />

                  <CompetitionFinalizationInfo settings={settings} />
                </div>

                <NextExecutionAlert nextExecution={nextExecution} />

                <WarningAlert settings={settings} />
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


import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Settings, History } from 'lucide-react';
import { AutomationDiagnostics } from './AutomationDiagnostics';
import { AutomationLogs } from '../AutomationLogs';
import { useAutomationLogs } from '@/hooks/useAutomationLogs';

export const AutomationSystemStatus = () => {
  const { logs } = useAutomationLogs();

  return (
    <Tabs defaultValue="diagnostics" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="diagnostics" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Diagnósticos
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          Histórico ({logs.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="diagnostics" className="mt-6">
        <AutomationDiagnostics />
      </TabsContent>

      <TabsContent value="history" className="mt-6">
        <AutomationLogs logs={logs} />
      </TabsContent>
    </Tabs>
  );
};

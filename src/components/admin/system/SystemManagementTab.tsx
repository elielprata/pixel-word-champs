
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, HardDrive, Activity, ArrowRightLeft } from 'lucide-react';
import { BackupRestorePanel } from './BackupRestorePanel';
import { DataMigrationPanel } from './DataMigrationPanel';
import { SystemMonitoringPanel } from './SystemMonitoringPanel';

export const SystemManagementTab = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-600 to-gray-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Gerenciamento do Sistema</h1>
            <p className="text-slate-100 text-sm">Backup, migração de dados e monitoramento de performance</p>
          </div>
        </div>
      </div>

      {/* Navegação por abas */}
      <Tabs defaultValue="monitoring" className="space-y-6">
        <TabsList className="bg-white p-1.5 shadow-lg border border-slate-200 rounded-xl h-auto">
          <TabsTrigger 
            value="monitoring" 
            className="flex items-center gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-gray-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <Activity className="h-4 w-4" />
            <span className="font-medium">Monitoramento</span>
          </TabsTrigger>
          <TabsTrigger 
            value="backup" 
            className="flex items-center gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-gray-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <HardDrive className="h-4 w-4" />
            <span className="font-medium">Backup & Restore</span>
          </TabsTrigger>
          <TabsTrigger 
            value="migration" 
            className="flex items-center gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-gray-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span className="font-medium">Migração de Dados</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring">
          <SystemMonitoringPanel />
        </TabsContent>

        <TabsContent value="backup">
          <BackupRestorePanel />
        </TabsContent>

        <TabsContent value="migration">
          <DataMigrationPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

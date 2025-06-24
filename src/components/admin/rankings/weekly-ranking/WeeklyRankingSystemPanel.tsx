
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  Zap, 
  Database, 
  Settings,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { WeeklyRankingDiagnostics } from './WeeklyRankingDiagnostics';
import { RealTimeMonitoringPanel } from '../RealTimeMonitoringPanel';
import { PerformanceOptimizationPanel } from '../PerformanceOptimizationPanel';

export const WeeklyRankingSystemPanel = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-blue-600" />
            Sistema de Ranking Semanal - Painel Avançado
          </CardTitle>
          <p className="text-sm text-gray-600">
            Monitoramento, diagnósticos e otimização em tempo real
          </p>
        </CardHeader>
      </Card>

      {/* Tabs do Sistema */}
      <Tabs defaultValue="diagnostics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="diagnostics" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Diagnósticos
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitoramento
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Otimização
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostics" className="mt-6">
          <WeeklyRankingDiagnostics />
        </TabsContent>

        <TabsContent value="monitoring" className="mt-6">
          <RealTimeMonitoringPanel />
        </TabsContent>

        <TabsContent value="optimization" className="mt-6">
          <PerformanceOptimizationPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

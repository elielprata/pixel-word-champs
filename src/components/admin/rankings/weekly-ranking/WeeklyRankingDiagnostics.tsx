
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RankingFlowAudit } from '../RankingFlowAudit';
import { ScoringSystemDiagnostics } from '../ScoringSystemDiagnostics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Database, Settings, Zap } from 'lucide-react';

export const WeeklyRankingDiagnostics = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Diagnósticos do Sistema de Ranking
        </CardTitle>
        <p className="text-sm text-gray-600">
          Ferramentas de auditoria, verificação e correção do fluxo de dados
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="scoring" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scoring" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Sistema de Pontuação
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Auditoria de Dados
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scoring" className="mt-6">
            <ScoringSystemDiagnostics />
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <RankingFlowAudit />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600">
                    Configurações avançadas do sistema em desenvolvimento
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

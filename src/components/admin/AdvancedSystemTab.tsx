
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Trophy, 
  Activity,
  Database,
  Shield
} from 'lucide-react';
import { WeeklyRankingSystemPanel } from './rankings/weekly-ranking/WeeklyRankingSystemPanel';
import { logger } from '@/utils/logger';

export const AdvancedSystemTab = () => {
  logger.debug('Renderizando aba do sistema avançado', undefined, 'ADVANCED_SYSTEM_TAB');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-lg shadow-md">
                <Settings className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Sistema Avançado
                </h1>
                <p className="text-slate-600 mt-1 text-sm">
                  Painel completo para gerenciamento avançado do sistema de ranking e monitoramento
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Tabs defaultValue="ranking-system" className="w-full">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <TabsList className="grid grid-cols-3 bg-white border border-slate-200">
                <TabsTrigger 
                  value="ranking-system" 
                  className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
                >
                  <Trophy className="h-4 w-4" />
                  Sistema de Ranking
                </TabsTrigger>
                <TabsTrigger 
                  value="system-health" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  <Activity className="h-4 w-4" />
                  Saúde do Sistema
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="flex items-center gap-2 data-[state=active]:bg-red-50 data-[state=active]:text-red-700"
                >
                  <Shield className="h-4 w-4" />
                  Segurança
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="ranking-system" className="space-y-6 mt-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-purple-600" />
                      Sistema de Ranking Semanal
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Controle avançado do sistema de ranking e competições semanais
                    </p>
                  </div>
                </div>
                <WeeklyRankingSystemPanel />
              </TabsContent>

              <TabsContent value="system-health" className="space-y-6 mt-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      Monitoramento de Saúde do Sistema
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Métricas de performance e saúde da plataforma
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">98.5%</div>
                        <div className="text-sm text-slate-600">Uptime</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">245ms</div>
                        <div className="text-sm text-slate-600">Latência Média</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">15</div>
                        <div className="text-sm text-slate-600">Conexões Ativas</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">2.1GB</div>
                        <div className="text-sm text-slate-600">Uso de Memória</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-6 mt-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-600" />
                      Monitoramento de Segurança
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Alertas e métricas de segurança da plataforma
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Tentativas de Login Suspeitas</span>
                        <span className="text-green-600 font-bold">0 hoje</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Usuários Banidos Ativos</span>
                        <span className="text-blue-600 font-bold">3 total</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Sessões Ativas</span>
                        <span className="text-purple-600 font-bold">127 usuários</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

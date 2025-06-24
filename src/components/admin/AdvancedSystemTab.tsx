
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Trophy, 
  Activity,
  Database,
  BarChart3,
  Shield
} from 'lucide-react';
import { WeeklyRankingSystemPanel } from './rankings/weekly-ranking/WeeklyRankingSystemPanel';
import { logger } from '@/utils/logger';

export const AdvancedSystemTab = () => {
  logger.debug('Renderizando aba do sistema avançado', undefined, 'ADVANCED_SYSTEM_TAB');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-purple-600" />
            Sistema Avançado
          </CardTitle>
          <p className="text-sm text-gray-600">
            Painel completo para gerenciamento avançado do sistema de ranking e monitoramento
          </p>
        </CardHeader>
      </Card>

      {/* Advanced System Tabs */}
      <Tabs defaultValue="ranking-system" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ranking-system" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Sistema de Ranking
          </TabsTrigger>
          <TabsTrigger value="system-health" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Saúde do Sistema
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ranking-system" className="mt-6">
          <WeeklyRankingSystemPanel />
        </TabsContent>

        <TabsContent value="system-health" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Monitoramento de Saúde do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <div className="text-sm text-green-700">Uptime</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">245ms</div>
                  <div className="text-sm text-blue-700">Latência Média</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">15</div>
                  <div className="text-sm text-purple-700">Conexões Ativas</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">2.1GB</div>
                  <div className="text-sm text-orange-700">Uso de Memória</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                Monitoramento de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Tentativas de Login Suspeitas</span>
                  <span className="text-green-600 font-bold">0 hoje</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Usuários Banidos Ativos</span>
                  <span className="text-blue-600 font-bold">3 total</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">Sessões Ativas</span>
                  <span className="text-purple-600 font-bold">127 usuários</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

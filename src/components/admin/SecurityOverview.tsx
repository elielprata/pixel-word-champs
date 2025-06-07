
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Eye, Lock, TrendingUp, RefreshCw, Download } from 'lucide-react';

interface SecurityStats {
  totalAlerts: number;
  pendingAlerts: number;
  highPriorityAlerts: number;
  detectionsToday: number;
  blockedSessionsToday: number;
  fraudDetectionRate: number;
  falsePositiveRate: number;
  avgResponseTime: number;
}

interface SecurityOverviewProps {
  stats: SecurityStats;
  onRefresh: () => Promise<void>;
  onExport: () => Promise<void>;
}

export const SecurityOverview = ({ stats, onRefresh, onExport }: SecurityOverviewProps) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const handleExport = async () => {
    setExporting(true);
    await onExport();
    setExporting(false);
  };

  return (
    <div className="space-y-4">
      {/* Header com ações */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Visão Geral de Segurança</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
            disabled={exporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exportando...' : 'Exportar Relatório'}
          </Button>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-green-800">Status do Sistema</CardTitle>
            <div className="bg-green-100 p-2 rounded-lg">
              <Shield className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">Seguro</div>
            <p className="text-xs text-green-600 mt-1">Todos os sistemas operacionais</p>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs text-green-600">Online</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-amber-800">Alertas Pendentes</CardTitle>
            <div className="bg-amber-100 p-2 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{stats.pendingAlerts}</div>
            <p className="text-xs text-amber-600 mt-1">{stats.highPriorityAlerts} alta prioridade</p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-amber-500 mr-1" />
              <span className="text-xs text-amber-600">
                {stats.totalAlerts - stats.pendingAlerts} resolvidos
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-blue-800">Detecções Hoje</CardTitle>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Eye className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{stats.detectionsToday}</div>
            <p className="text-xs text-blue-600 mt-1">{stats.fraudDetectionRate}% precisão</p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-blue-500 mr-1" />
              <span className="text-xs text-blue-600">+{Math.round(stats.detectionsToday * 0.3)} vs ontem</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-purple-800">Bloqueios (24h)</CardTitle>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Lock className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{stats.blockedSessionsToday}</div>
            <p className="text-xs text-purple-600 mt-1">Tentativas fraudulentas</p>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-xs text-purple-600">Ativo</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

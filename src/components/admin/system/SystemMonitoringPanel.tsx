
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Activity, Server, Database, Users, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface SystemMetric {
  name: string;
  value: string | number;
  unit?: string;
  status: 'good' | 'warning' | 'error';
  description: string;
}

interface PerformanceData {
  timestamp: string;
  response_time: number;
  active_users: number;
  database_size: number;
  error_rate: number;
}

export const SystemMonitoringPanel = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  const generateMockMetrics = async (): Promise<SystemMetric[]> => {
    // Simular coleta de métricas do sistema
    const { data: userCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' });

    const { data: sessionsToday } = await supabase
      .from('game_sessions')
      .select('id', { count: 'exact' })
      .gte('started_at', new Date().toISOString().split('T')[0]);

    return [
      {
        name: 'Tempo de Resposta da API',
        value: Math.random() * 200 + 50,
        unit: 'ms',
        status: 'good',
        description: 'Tempo médio de resposta das consultas'
      },
      {
        name: 'Usuários Ativos',
        value: userCount?.length || 0,
        status: 'good',
        description: 'Total de usuários registrados'
      },
      {
        name: 'Sessões Hoje',
        value: sessionsToday?.length || 0,
        status: 'good',
        description: 'Sessões de jogo iniciadas hoje'
      },
      {
        name: 'Uso de CPU',
        value: Math.random() * 30 + 10,
        unit: '%',
        status: 'good',
        description: 'Utilização do processador'
      },
      {
        name: 'Uso de Memória',
        value: Math.random() * 40 + 30,
        unit: '%',
        status: 'good',
        description: 'Utilização da memória RAM'
      },
      {
        name: 'Conexões DB',
        value: Math.floor(Math.random() * 20 + 5),
        status: 'good',
        description: 'Conexões ativas com o banco'
      },
      {
        name: 'Taxa de Erro',
        value: Math.random() * 2,
        unit: '%',
        status: Math.random() * 2 > 1 ? 'warning' : 'good',
        description: 'Porcentagem de requisições com erro'
      },
      {
        name: 'Uptime',
        value: '99.9',
        unit: '%',
        status: 'good',
        description: 'Disponibilidade do sistema'
      }
    ];
  };

  const updateMetrics = async () => {
    setLoading(true);
    try {
      const newMetrics = await generateMockMetrics();
      setMetrics(newMetrics);
      
      // Adicionar dados de performance históricos
      const newPerformancePoint: PerformanceData = {
        timestamp: new Date().toISOString(),
        response_time: newMetrics.find(m => m.name === 'Tempo de Resposta da API')?.value as number || 0,
        active_users: newMetrics.find(m => m.name === 'Usuários Ativos')?.value as number || 0,
        database_size: Math.random() * 100 + 500,
        error_rate: newMetrics.find(m => m.name === 'Taxa de Erro')?.value as number || 0
      };

      setPerformanceData(prev => [...prev.slice(-23), newPerformancePoint]);
      setLastUpdate(new Date());

      toast({
        title: "Métricas atualizadas",
        description: "Dados do sistema atualizados com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar as métricas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateMetrics();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(updateMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: SystemMetric['status']) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: SystemMetric['status']) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-700';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700';
      case 'error':
        return 'bg-red-100 text-red-700';
    }
  };

  const formatValue = (value: string | number, unit?: string) => {
    if (typeof value === 'number') {
      return `${value.toFixed(1)}${unit || ''}`;
    }
    return `${value}${unit || ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Header com botão de atualização */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Monitoramento do Sistema
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
              </p>
            </div>
            <Button
              onClick={updateMetrics}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas em tempo real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                {getStatusIcon(metric.status)}
                <Badge className={getStatusColor(metric.status)}>
                  {metric.status === 'good' && 'OK'}
                  {metric.status === 'warning' && 'Atenção'}
                  {metric.status === 'error' && 'Erro'}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {formatValue(metric.value, metric.unit)}
                </p>
                <p className="text-sm font-medium text-gray-900">{metric.name}</p>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumo de performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Status do Servidor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Sistema</span>
                <Badge className="bg-green-100 text-green-700">Online</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Banco de Dados</span>
                <Badge className="bg-green-100 text-green-700">Conectado</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">API</span>
                <Badge className="bg-green-100 text-green-700">Funcionando</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Autenticação</span>
                <Badge className="bg-green-100 text-green-700">Ativa</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Banco de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Conexões Ativas</span>
                <span className="font-medium">
                  {metrics.find(m => m.name === 'Conexões DB')?.value || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Tamanho</span>
                <span className="font-medium">
                  {performanceData.length > 0 ? 
                    `${performanceData[performanceData.length - 1].database_size.toFixed(1)} MB` : 
                    'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Tempo de Resposta</span>
                <span className="font-medium">
                  {formatValue(metrics.find(m => m.name === 'Tempo de Resposta da API')?.value || 0, 'ms')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Atividade de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Total de Usuários</span>
                <span className="font-medium">
                  {metrics.find(m => m.name === 'Usuários Ativos')?.value || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Sessões Hoje</span>
                <span className="font-medium">
                  {metrics.find(m => m.name === 'Sessões Hoje')?.value || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Taxa de Erro</span>
                <span className="font-medium">
                  {formatValue(metrics.find(m => m.name === 'Taxa de Erro')?.value || 0, '%')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.filter(m => m.status !== 'good').length === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Todos os sistemas funcionando normalmente</span>
              </div>
            ) : (
              metrics
                .filter(m => m.status !== 'good')
                .map((metric, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-yellow-800">
                      {metric.name}: {formatValue(metric.value, metric.unit)} - {metric.description}
                    </span>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Trophy, 
  Settings, 
  Activity,
  Calendar,
  DollarSign,
  Shield,
  BarChart3,
  Plus,
  Eye,
  FileText
} from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const mockStats = {
    dau: 1250,
    retention: { d1: 85, d3: 65, d7: 45 },
    revenue: 2850,
    activeChallenges: 3,
    totalUsers: 8500
  };

  const mockChallenges = [
    { id: 1, title: "Desafio Matinal", status: "Ativo", players: 450, avgScore: 280 },
    { id: 2, title: "Animais Selvagens", status: "Agendado", players: 0, avgScore: 0 },
    { id: 3, title: "Cidades do Brasil", status: "Finalizado", players: 320, avgScore: 315 }
  ];

  const mockFraudAlerts = [
    { id: 1, user: "user_123", reason: "Pontuação suspeita", severity: "high" },
    { id: 2, user: "user_456", reason: "Tempo inconsistente", severity: "medium" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
        <p className="text-gray-600">Letra Arena - Sistema de Gestão</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="challenges">Desafios</TabsTrigger>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
          <TabsTrigger value="payments">Premiação</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">DAU</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.dau.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12% vs ontem</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retenção D7</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.retention.d7}%</div>
                <p className="text-xs text-muted-foreground">Meta: 50%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Semanal</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {mockStats.revenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Prêmios distribuídos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Desafios Ativos</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.activeChallenges}</div>
                <p className="text-xs text-muted-foreground">Total: {mockChallenges.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Alertas de Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                Alertas de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockFraudAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <span className="font-medium">{alert.user}</span>
                      <p className="text-sm text-gray-600">{alert.reason}</p>
                    </div>
                    <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                      {alert.severity === 'high' ? 'Alto' : 'Médio'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestão de Desafios */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestão de Desafios</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Desafio
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Desafios Criados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockChallenges.map(challenge => (
                  <div key={challenge.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{challenge.title}</h3>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>{challenge.players} jogadores</span>
                        <span>Média: {challenge.avgScore} pts</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        challenge.status === 'Ativo' ? 'default' :
                        challenge.status === 'Agendado' ? 'secondary' : 'outline'
                      }>
                        {challenge.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rankings */}
        <TabsContent value="rankings" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Rankings</h2>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ranking Global Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Rankings são somente leitura</p>
                <p className="text-sm">Dados atualizados em tempo real via API</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Premiação */}
        <TabsContent value="payments" className="space-y-6">
          <h2 className="text-2xl font-bold">Sistema de Premiação</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Pagamentos Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Sistema de pagamentos via Pix</p>
                <p className="text-sm">Em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="security" className="space-y-6">
          <h2 className="text-2xl font-bold">Segurança e Logs</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Sistema Antifraude</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Detecção automática ativa</span>
                  <Badge variant="default">Ativo</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Alertas em tempo real</span>
                  <Badge variant="default">Ativo</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Validação de pontuação</span>
                  <Badge variant="default">Ativo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Métricas */}
        <TabsContent value="metrics" className="space-y-6">
          <h2 className="text-2xl font-bold">Métricas e Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Retenção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>D1</span>
                    <span className="font-bold">{mockStats.retention.d1}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>D3</span>
                    <span className="font-bold">{mockStats.retention.d3}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>D7</span>
                    <span className="font-bold">{mockStats.retention.d7}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Uso de Anúncios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Dicas</span>
                    <span className="font-bold">450/dia</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revives</span>
                    <span className="font-bold">320/dia</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Conversão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Convites</span>
                    <span className="font-bold">12.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retenção D3</span>
                    <span className="font-bold">68%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;

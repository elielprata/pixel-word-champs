
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { ChallengesTab } from "@/components/admin/ChallengesTab";
import { RankingsTab } from "@/components/admin/RankingsTab";
import { PaymentsTab } from "@/components/admin/PaymentsTab";
import { SecurityTab } from "@/components/admin/SecurityTab";
import { MetricsTab } from "@/components/admin/MetricsTab";
import { UsersTab } from "@/components/admin/UsersTab";
import { BarChart3, Shield, Users, Trophy, CreditCard, Target, Activity, TrendingUp, AlertCircle, Plus } from 'lucide-react';

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
    { id: 1, title: "Desafio Matinal", status: "Ativo", players: 450 },
    { id: 2, title: "Animais Selvagens", status: "Agendado", players: 0 },
    { id: 3, title: "Cidades do Brasil", status: "Finalizado", players: 320 }
  ];

  const tabConfig = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'challenges', label: 'Desafios', icon: Target },
    { id: 'rankings', label: 'Rankings', icon: Trophy },
    { id: 'payments', label: 'Premiação', icon: CreditCard },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'security', label: 'Segurança', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header Reformulado */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Centro de Controle</h1>
                <p className="text-slate-600 mt-1">Painel Administrativo - Letra Arena</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Sistema Online
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                <Users className="h-3 w-3 mr-2" />
                {mockStats.totalUsers.toLocaleString()} usuários
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                <Activity className="h-3 w-3 mr-2" />
                {mockStats.dau.toLocaleString()} DAU
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Navigation Tabs Reformulada */}
          <div className="mb-8">
            <TabsList className="bg-white p-1.5 shadow-lg border border-slate-200 rounded-xl h-auto">
              {tabConfig.map((tab) => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  className="flex items-center gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-slate-50"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Contents */}
          <div className="space-y-8">
            {/* Dashboard Reformulado */}
            <TabsContent value="dashboard" className="space-y-8 mt-0">
              {/* Hero Section com estatísticas principais */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
                <div className="relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-2">
                      <h2 className="text-2xl font-bold mb-2">Visão Geral do Sistema</h2>
                      <p className="text-blue-100 mb-6">Acompanhe as principais métricas da plataforma em tempo real</p>
                      <div className="flex flex-wrap gap-4">
                        <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                          <div className="text-sm text-blue-100">Crescimento DAU</div>
                          <div className="text-xl font-bold">+12%</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                          <div className="text-sm text-blue-100">Meta Retenção</div>
                          <div className="text-xl font-bold">80%</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <Users className="h-6 w-6" />
                        <span className="font-semibold">Usuários Ativos</span>
                      </div>
                      <div className="text-3xl font-bold mb-2">{mockStats.dau.toLocaleString()}</div>
                      <div className="text-sm text-blue-100">Hoje • +12% vs ontem</div>
                    </div>
                    
                    <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border-2 border-dashed border-white/20">
                      <div className="flex items-center gap-3 mb-4">
                        <Plus className="h-6 w-6 text-white/60" />
                        <span className="font-semibold text-white/60">Nova Métrica</span>
                      </div>
                      <div className="text-2xl font-bold mb-2 text-white/60">Em breve</div>
                      <div className="text-sm text-blue-100/60">Espaço reservado para futura métrica</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cards de Métricas Detalhadas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-emerald-500 p-3 rounded-xl">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Ativo</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-700 mb-1">Desafios Ativos</h3>
                    <div className="text-3xl font-bold text-emerald-700 mb-2">{mockStats.activeChallenges}</div>
                    <p className="text-sm text-emerald-600">2 agendados para amanhã</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-blue-500 p-3 rounded-xl">
                        <Activity className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">Excelente</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-700 mb-1">Retenção D1</h3>
                    <div className="text-3xl font-bold text-blue-700 mb-2">{mockStats.retention.d1}%</div>
                    <p className="text-sm text-blue-600">Meta: 80% • +5% vs semana</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-amber-500 p-3 rounded-xl">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200">Crescendo</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-700 mb-1">Base de Usuários</h3>
                    <div className="text-3xl font-bold text-amber-700 mb-2">{(mockStats.totalUsers / 1000).toFixed(1)}k</div>
                    <p className="text-sm text-amber-600">+350 novos esta semana</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-purple-500 p-3 rounded-xl">
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">Semanal</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-700 mb-1">Prêmios Pagos</h3>
                    <div className="text-3xl font-bold text-purple-700 mb-2">R$ {(mockStats.revenue * 0.3).toFixed(0)}</div>
                    <p className="text-sm text-purple-600">45 ganhadores esta semana</p>
                  </CardContent>
                </Card>
              </div>

              {/* Alertas e Notificações */}
              <Card className="border-l-4 border-l-amber-500 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <CardTitle className="text-lg text-amber-800">Alertas do Sistema</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-green-800">Sistema funcionando normalmente</h4>
                        <p className="text-sm text-green-600 mt-1">Todos os serviços operacionais - Última verificação: há 2 minutos</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-blue-800">Backup automático concluído</h4>
                        <p className="text-sm text-blue-600 mt-1">Último backup realizado com sucesso às 03:00</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>

              {/* Métricas Detalhadas */}
              <MetricsTab retention={mockStats.retention} />
            </TabsContent>

            {/* Other Tabs */}
            <TabsContent value="challenges" className="mt-0">
              <ChallengesTab challenges={mockChallenges} />
            </TabsContent>

            <TabsContent value="rankings" className="mt-0">
              <RankingsTab />
            </TabsContent>

            <TabsContent value="payments" className="mt-0">
              <PaymentsTab />
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              <UsersTab />
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <SecurityTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;

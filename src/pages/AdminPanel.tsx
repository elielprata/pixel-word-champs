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
import { BarChart3, Shield, Users, Trophy, CreditCard, Target, Activity } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Painel Administrativo</h1>
              <p className="text-sm text-slate-600 mt-1">Letra Arena - Centro de Controle</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Sistema Online
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {mockStats.totalUsers.toLocaleString()} usuários
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Navigation Tabs */}
          <div className="mb-6">
            <TabsList className="bg-white p-1 shadow-sm border border-slate-200 rounded-lg">
              {tabConfig.map((tab) => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Contents */}
          <div className="space-y-6">
            {/* Dashboard */}
            <TabsContent value="dashboard" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium opacity-90">Usuários Ativos (DAU)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockStats.dau.toLocaleString()}</div>
                    <p className="text-xs opacity-80 mt-1">+12% vs ontem</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium opacity-90">Receita Mensal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ {mockStats.revenue.toLocaleString()}</div>
                    <p className="text-xs opacity-80 mt-1">+8% vs mês anterior</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium opacity-90">Desafios Ativos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockStats.activeChallenges}</div>
                    <p className="text-xs opacity-80 mt-1">2 agendados</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium opacity-90">Retenção D1</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockStats.retention.d1}%</div>
                    <p className="text-xs opacity-80 mt-1">Meta: 80%</p>
                  </CardContent>
                </Card>
              </div>
              
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

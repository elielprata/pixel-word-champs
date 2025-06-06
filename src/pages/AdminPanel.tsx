
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { ChallengesTab } from "@/components/admin/ChallengesTab";
import { RankingsTab } from "@/components/admin/RankingsTab";
import { PaymentsTab } from "@/components/admin/PaymentsTab";
import { SecurityTab } from "@/components/admin/SecurityTab";
import { MetricsTab } from "@/components/admin/MetricsTab";

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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
        <p className="text-gray-600">Letra Arena - Sistema de Gestão</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-1 h-auto p-1">
          <TabsTrigger value="dashboard" className="text-xs lg:text-sm">Dashboard</TabsTrigger>
          <TabsTrigger value="challenges" className="text-xs lg:text-sm">Desafios</TabsTrigger>
          <TabsTrigger value="rankings" className="text-xs lg:text-sm">Rankings</TabsTrigger>
          <TabsTrigger value="payments" className="text-xs lg:text-sm">Premiação</TabsTrigger>
          <TabsTrigger value="security" className="text-xs lg:text-sm">Segurança</TabsTrigger>
          <TabsTrigger value="metrics" className="text-xs lg:text-sm">Métricas</TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <DashboardStats stats={mockStats} totalChallenges={mockChallenges.length} />
        </TabsContent>

        {/* Gestão de Desafios */}
        <TabsContent value="challenges" className="space-y-6">
          <ChallengesTab challenges={mockChallenges} />
        </TabsContent>

        {/* Rankings */}
        <TabsContent value="rankings" className="space-y-6">
          <RankingsTab />
        </TabsContent>

        {/* Premiação */}
        <TabsContent value="payments" className="space-y-6">
          <PaymentsTab />
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="security" className="space-y-6">
          <SecurityTab />
        </TabsContent>

        {/* Métricas */}
        <TabsContent value="metrics" className="space-y-6">
          <MetricsTab retention={mockStats.retention} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;

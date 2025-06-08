
import React from 'react';
import AdminRoute from '@/components/auth/AdminRoute';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { UsersTab } from "@/components/admin/UsersTab";
import { ChallengesTab } from "@/components/admin/ChallengesTab";
import { RankingsTab } from "@/components/admin/RankingsTab";
import { GameContentTab } from "@/components/admin/GameContentTab";
import { MetricsTab } from "@/components/admin/MetricsTab";
import { SupportTab } from "@/components/admin/SupportTab";
import { AllUsersTab } from '@/components/admin/AllUsersTab';

const AdminPanel = () => {
  // Mock data for challenges - you can replace with real data later
  const mockChallenges = [
    {
      id: 1,
      title: "Desafio Semanal #1",
      status: "Ativo",
      players: 245
    },
    {
      id: 2,
      title: "Torneio Especial",
      status: "Agendado", 
      players: 89
    },
    {
      id: 3,
      title: "Competição Mensal",
      status: "Ativo",
      players: 378
    }
  ];

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Painel Administrativo
            </h1>
            <p className="text-slate-600 mt-2">
              Gerencie todos os aspectos da plataforma
            </p>
          </div>

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-9 lg:grid-cols-9">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="all-users">Segurança</TabsTrigger>
              <TabsTrigger value="challenges">Desafios</TabsTrigger>
              <TabsTrigger value="rankings">Rankings</TabsTrigger>
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="metrics">Métricas</TabsTrigger>
              <TabsTrigger value="support">Suporte</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <DashboardStats totalChallenges={5} />
            </TabsContent>

            <TabsContent value="users">
              <UsersTab />
            </TabsContent>

            <TabsContent value="all-users">
              <AllUsersTab />
            </TabsContent>

            <TabsContent value="challenges">
              <ChallengesTab challenges={mockChallenges} />
            </TabsContent>

            <TabsContent value="rankings">
              <RankingsTab />
            </TabsContent>

            <TabsContent value="content">
              <GameContentTab />
            </TabsContent>

            <TabsContent value="metrics">
              <MetricsTab />
            </TabsContent>

            <TabsContent value="support">
              <SupportTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminPanel;

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from './Overview';
import { WeeklyTournamentsManagement } from './content/WeeklyTournamentsManagement';
import { DailyChallengesManagement } from './content/DailyChallengesManagement';
import { UsersManagement } from './users/UsersManagement';
import { PrizesConfiguration } from './prizes/PrizesConfiguration';
import { DataRecoveryPanel } from './data/DataRecoveryPanel';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Painel Administrativo
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-max">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="weekly-tournaments">Torneios Semanais</TabsTrigger>
            <TabsTrigger value="daily-challenges">Desafios Diários</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="prizes">Premiações</TabsTrigger>
            <TabsTrigger value="data-recovery">Recuperação</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Overview />
          </TabsContent>

          <TabsContent value="weekly-tournaments" className="space-y-6">
            <WeeklyTournamentsManagement />
          </TabsContent>

          <TabsContent value="daily-challenges" className="space-y-6">
            <DailyChallengesManagement />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="prizes" className="space-y-6">
            <PrizesConfiguration />
          </TabsContent>

          <TabsContent value="data-recovery" className="space-y-6">
            <DataRecoveryPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminRoute from '@/components/auth/AdminRoute';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardStats } from "@/components/admin/DashboardStats";
import { UsersTab } from "@/components/admin/UsersTab";
import { RankingsTab } from "@/components/admin/RankingsTab";
import { GameContentTab } from "@/components/admin/GameContentTab";
import { SupportTab } from "@/components/admin/SupportTab";
import { IntegrationsTab } from '@/components/admin/IntegrationsTab';
const AdminPanel = () => {
  const navigate = useNavigate();
  const {
    logout
  } = useAuth();
  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };
  return <AdminRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Painel Administrativo
              </h1>
              <p className="text-slate-600 mt-2">
                Gerencie todos os aspectos da plataforma
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2 hover:bg-red-50 border-red-200 text-red-700">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-6 lg:grid-cols-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="rankings">Competições</TabsTrigger>
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="support">Suporte</TabsTrigger>
              <TabsTrigger value="integrations">Integrações</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <DashboardStats />
            </TabsContent>

            <TabsContent value="users">
              <UsersTab />
            </TabsContent>

            <TabsContent value="rankings">
              <RankingsTab />
            </TabsContent>

            <TabsContent value="content">
              <GameContentTab />
            </TabsContent>

            <TabsContent value="support">
              <SupportTab />
            </TabsContent>

            <TabsContent value="integrations">
              <IntegrationsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminRoute>;
};
export default AdminPanel;
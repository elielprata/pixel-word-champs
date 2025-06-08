
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, UserCog, Activity, TrendingUp } from 'lucide-react';
import { AdminManagement } from "./AdminManagement";
import { UserStatsCards } from "./UserStatsCards";
import { AllUsersList } from "./AllUsersList";

export const UsersTab = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-md">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Gestão de Usuários
                </h1>
                <p className="text-slate-600 mt-1 text-sm">
                  Administre usuários, permissões e monitore a atividade da plataforma
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                Sistema Online
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Métricas Ativas
              </Badge>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Visão Geral</h2>
          </div>
          <UserStatsCards />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Tabs defaultValue="all-users" className="w-full">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-white border border-slate-200">
                <TabsTrigger value="all-users" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <Users className="h-4 w-4" />
                  Todos os Usuários
                </TabsTrigger>
                <TabsTrigger value="admins" className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                  <Shield className="h-4 w-4" />
                  Administradores
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="all-users" className="space-y-6 mt-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <UserCog className="h-5 w-5 text-blue-600" />
                      Lista de Usuários
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Visualize e gerencie todos os usuários cadastrados no sistema
                    </p>
                  </div>
                </div>
                <AllUsersList />
              </TabsContent>

              <TabsContent value="admins" className="space-y-6 mt-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      Administradores
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Gerencie permissões administrativas e crie novos administradores
                    </p>
                  </div>
                </div>
                <AdminManagement />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

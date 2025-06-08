
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, UserCog, Activity } from 'lucide-react';
import { AdminManagement } from "./AdminManagement";
import { UserStatsCards } from "./UserStatsCards";
import { AllUsersList } from "./AllUsersList";

export const UsersTab = () => {
  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-xl">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Gestão de Usuários
            </h1>
            <p className="text-slate-600 mt-1">
              Administre usuários, permissões e estatísticas da plataforma
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Sistema Ativo
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
            <Activity className="h-3 w-3 mr-1" />
            Monitoramento
          </Badge>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <UserStatsCards />

      {/* Tabs de Funcionalidades */}
      <Tabs defaultValue="all-users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="all-users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Todos os Usuários
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Administradores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-users" className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <UserCog className="h-5 w-5 text-blue-600" />
              Lista Completa de Usuários
            </h3>
            <p className="text-slate-600">
              Visualize, edite, bane e gerencie todos os usuários cadastrados no sistema.
            </p>
          </div>
          <AllUsersList />
        </TabsContent>

        <TabsContent value="admins" className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Gerenciamento de Administradores
            </h3>
            <p className="text-slate-600">
              Crie novos administradores e gerencie permissões de usuários existentes.
            </p>
          </div>
          <AdminManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

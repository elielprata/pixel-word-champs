
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, UserCog, BarChart3 } from 'lucide-react';
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
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Gestão de Usuários</h2>
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
            <BarChart3 className="h-3 w-3 mr-1" />
            Monitoramento
          </Badge>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <UserStatsCards />

      {/* Tabs de Funcionalidades */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200">
          <CardTitle className="text-xl text-slate-900">Gerenciamento de Usuários</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
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
        </CardContent>
      </Card>
    </div>
  );
};


import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, UserCog } from 'lucide-react';
import { AdminManagement } from "./AdminManagement";
import { UserStatsCards } from "./UserStatsCards";
import { AllUsersList } from "./AllUsersList";
import { UserHeaderSection } from "./UserHeaderSection";

export const UsersTab = () => {
  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <UserHeaderSection />

      {/* Cards de Estatísticas */}
      <UserStatsCards />

      {/* Tabs de Funcionalidades */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-white border-b border-slate-100">
          <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
            <UserCog className="h-5 w-5 text-blue-600" />
            Gerenciamento de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all-users" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-50 m-0 rounded-none border-b">
              <TabsTrigger 
                value="all-users" 
                className="flex items-center gap-2 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
              >
                <Users className="h-4 w-4" />
                Todos os Usuários
              </TabsTrigger>
              <TabsTrigger 
                value="admins" 
                className="flex items-center gap-2 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
              >
                <Shield className="h-4 w-4" />
                Administradores
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all-users" className="p-6 space-y-4 mt-0">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Lista Completa de Usuários
                </h3>
                <p className="text-slate-600 text-sm">
                  Visualize, edite e gerencie todos os usuários cadastrados no sistema.
                </p>
              </div>
              <AllUsersList />
            </TabsContent>

            <TabsContent value="admins" className="p-6 space-y-4 mt-0">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Gerenciamento de Administradores
                </h3>
                <p className="text-slate-600 text-sm">
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

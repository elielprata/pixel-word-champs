
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, UserCog, Trophy, TrendingUp, Gamepad2 } from 'lucide-react';
import { AdminManagement } from "./AdminManagement";
import { UserStatsCards } from "./UserStatsCards";
import { AllUsersList } from "./AllUsersList";
import { UserHeaderSection } from "./UserHeaderSection";

export const UsersTab = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>
        <div className="relative px-6 py-8">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Central de Usuários
                </h1>
                <p className="text-slate-600 mt-2 text-lg">
                  Gerencie jogadores, estatísticas e conquistas da plataforma
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-2">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                Sistema Online
              </Badge>
              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 px-4 py-2">
                <TrendingUp className="h-4 w-4 mr-2" />
                Monitoramento Ativo
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-8 space-y-8">
        {/* Estatísticas Gamificadas */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-slate-800">Estatísticas do Reino</h2>
            <div className="h-px bg-gradient-to-r from-yellow-200 to-transparent flex-1"></div>
          </div>
          <UserStatsCards />
        </div>

        {/* Painel de Controle */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <Gamepad2 className="h-6 w-6 text-indigo-600" />
              <CardTitle className="text-xl text-slate-900">Painel de Controle</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <Tabs defaultValue="all-users" className="w-full">
              <div className="px-6 pt-6">
                <TabsList className="grid w-full grid-cols-2 h-12 bg-slate-100">
                  <TabsTrigger 
                    value="all-users" 
                    className="flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
                  >
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Todos os Jogadores</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="admins" 
                    className="flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">Administradores</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all-users" className="space-y-6 p-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <UserCog className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Arena dos Jogadores</h3>
                  </div>
                  <p className="text-slate-600">
                    Visualize, gerencie e administre todos os guerreiros cadastrados no sistema.
                  </p>
                </div>
                <AllUsersList />
              </TabsContent>

              <TabsContent value="admins" className="space-y-6 p-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Conselho de Administradores</h3>
                  </div>
                  <p className="text-slate-600">
                    Gerencie os guardiões do sistema e suas permissões especiais.
                  </p>
                </div>
                <AdminManagement />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

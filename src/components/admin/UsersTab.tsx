
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Shield, Activity } from 'lucide-react';
import { AdminManagement } from "./AdminManagement";

export const UsersTab = () => {
  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-blue-800">Total de Usuários</CardTitle>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">8,524</div>
            <p className="text-xs text-blue-600 mt-1">+12% este mês</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-green-800">Usuários Ativos</CardTitle>
            <div className="bg-green-100 p-2 rounded-lg">
              <Activity className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">1,250</div>
            <p className="text-xs text-green-600 mt-1">Últimas 24h</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-purple-800">Administradores</CardTitle>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Shield className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">3</div>
            <p className="text-xs text-purple-600 mt-1">Usuários com acesso admin</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-amber-800">Novos Usuários</CardTitle>
            <div className="bg-amber-100 p-2 rounded-lg">
              <UserPlus className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">45</div>
            <p className="text-xs text-amber-600 mt-1">Esta semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Gerenciamento de Administradores */}
      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900">Gerenciamento de Administradores</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Crie novos administradores e gerencie permissões de usuários existentes
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Área Restrita
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <AdminManagement />
        </CardContent>
      </Card>
    </div>
  );
};

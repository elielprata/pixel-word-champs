
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from 'lucide-react';
import { AdminManagement } from "./AdminManagement";
import { UserHeaderSection } from "./UserHeaderSection";
import { UserStatsCards } from "./UserStatsCards";
import { UserMetricsGrid } from "./UserMetricsGrid";

export const UsersTab = () => {
  return (
    <div className="space-y-8">
      {/* Header Principal */}
      <UserHeaderSection />

      {/* Cards de Estatísticas Principais */}
      <UserStatsCards />

      {/* Métricas Adicionais */}
      <UserMetricsGrid />

      {/* Seção de Gerenciamento de Administradores */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-3 rounded-xl">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-900">Gerenciamento de Administradores</CardTitle>
                <p className="text-slate-600 mt-2">
                  Crie novos administradores e gerencie permissões de usuários existentes
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                <Shield className="h-3 w-3 mr-1" />
                Área Restrita
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Ativo
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <AdminManagement />
        </CardContent>
      </Card>
    </div>
  );
};

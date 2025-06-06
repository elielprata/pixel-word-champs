
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Shield, Activity, TrendingUp, UserCheck } from 'lucide-react';

export const UserStatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-100 hover:shadow-xl transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-sm font-semibold text-blue-800">Total de Usuários</CardTitle>
            <div className="text-3xl font-bold text-blue-700 mt-2">8,524</div>
          </div>
          <div className="bg-blue-500 p-3 rounded-xl">
            <Users className="h-6 w-6 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">+12% este mês</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">Base de usuários crescendo</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 hover:shadow-xl transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-sm font-semibold text-green-800">Usuários Ativos</CardTitle>
            <div className="text-3xl font-bold text-green-700 mt-2">1,250</div>
          </div>
          <div className="bg-green-500 p-3 rounded-xl">
            <Activity className="h-6 w-6 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600">Últimas 24h</span>
          </div>
          <p className="text-xs text-green-600 mt-1">14.7% da base total</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100 hover:shadow-xl transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-sm font-semibold text-purple-800">Administradores</CardTitle>
            <div className="text-3xl font-bold text-purple-700 mt-2">3</div>
          </div>
          <div className="bg-purple-500 p-3 rounded-xl">
            <Shield className="h-6 w-6 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
            Acesso Total
          </Badge>
          <p className="text-xs text-purple-600 mt-1">Usuários com acesso admin</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-100 hover:shadow-xl transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-sm font-semibold text-amber-800">Novos Usuários</CardTitle>
            <div className="text-3xl font-bold text-amber-700 mt-2">45</div>
          </div>
          <div className="bg-amber-500 p-3 rounded-xl">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-600">Esta semana</span>
          </div>
          <p className="text-xs text-amber-600 mt-1">6.4 novos usuários/dia</p>
        </CardContent>
      </Card>
    </div>
  );
};

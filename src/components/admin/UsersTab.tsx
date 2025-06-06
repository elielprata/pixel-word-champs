
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Shield, Activity, TrendingUp, UserCheck, AlertCircle } from 'lucide-react';
import { AdminManagement } from "./AdminManagement";

export const UsersTab = () => {
  return (
    <div className="space-y-8">
      {/* Header Principal */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <Users className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
                  <p className="text-blue-100 mt-1">Administre usuários e suas permissões na plataforma</p>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-sm text-blue-100">Crescimento</div>
                  <div className="text-xl font-bold">+12%</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-sm text-blue-100">Retenção</div>
                  <div className="text-xl font-bold">85%</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-sm text-blue-100">Engajamento</div>
                  <div className="text-xl font-bold">94%</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-sm text-blue-100">Satisfação</div>
                  <div className="text-xl font-bold">4.8/5</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas Principais */}
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

      {/* Métricas Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <div className="bg-slate-100 p-2 rounded-lg">
                <TrendingUp className="h-4 w-4 text-slate-600" />
              </div>
              <span className="text-lg">Crescimento Mensal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Janeiro</span>
                <span className="font-semibold text-green-600">+8.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Fevereiro</span>
                <span className="font-semibold text-green-600">+12.4%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Março</span>
                <span className="font-semibold text-green-600">+15.1%</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Média Trimestral</span>
                  <span className="font-bold text-blue-600">+11.9%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <div className="bg-slate-100 p-2 rounded-lg">
                <Activity className="h-4 w-4 text-slate-600" />
              </div>
              <span className="text-lg">Atividade Recente</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-slate-700">350 usuários online</p>
                  <p className="text-xs text-slate-500">Agora mesmo</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-slate-700">23 novos registros</p>
                  <p className="text-xs text-slate-500">Últimas 6 horas</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-slate-700">1,2k sessões ativas</p>
                  <p className="text-xs text-slate-500">Hoje</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <div className="bg-slate-100 p-2 rounded-lg">
                <AlertCircle className="h-4 w-4 text-slate-600" />
              </div>
              <span className="text-lg">Status do Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Sistema de Auth</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Database</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Estável
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">API Response</span>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  120ms
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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

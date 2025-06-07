import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { GameContentTab } from "@/components/admin/GameContentTab";
import { RankingsTab } from "@/components/admin/RankingsTab";
import { PaymentsTab } from "@/components/admin/PaymentsTab";
import { SecurityTab } from "@/components/admin/SecurityTab";
import { MetricsTab } from "@/components/admin/MetricsTab";
import { UsersTab } from "@/components/admin/UsersTab";
import { SupportTab } from "@/components/admin/SupportTab";
import { UserStatsCards } from "@/components/admin/UserStatsCards";
import { UserMetricsGrid } from "@/components/admin/UserMetricsGrid";
import { SecurityOverview } from "@/components/admin/SecurityOverview";
import { SecurityMetrics } from "@/components/admin/SecurityMetrics";
import { BarChart3, Shield, Users, Trophy, CreditCard, Activity, TrendingUp, AlertCircle, Plus, Gamepad2, MessageSquare, Clock, CheckCircle, AlertTriangle, LogOut, Calendar, DollarSign, Settings, Zap } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';

interface Report {
  id: string;
  report_type: string;
  status: string;
  priority: string;
  created_at: string;
}

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const { toast } = useToast();

  const mockStats = {
    dau: 1250,
    retention: { d1: 85, d3: 65, d7: 45 },
    revenue: 2850,
    activeChallenges: 3,
    totalUsers: 8500
  };

  // Query para buscar dados do dashboard
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const [
        { data: totalUsers },
        { data: activeCompetitions },
        { data: weeklyWinners },
        { data: gameSettings },
        { data: recentReports }
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('competitions').select('id').eq('is_active', true),
        supabase.from('weekly_rankings').select('id, prize').not('prize', 'is', null).gte('prize', 1),
        supabase.from('game_settings').select('id', { count: 'exact', head: true }),
        supabase.from('user_reports').select('id, status, priority').eq('status', 'pending').limit(5)
      ]);

      return {
        totalUsers: totalUsers || 0,
        activeCompetitions: activeCompetitions?.length || 0,
        weeklyWinners: weeklyWinners?.length || 0,
        totalPrizePool: weeklyWinners?.reduce((sum, w) => sum + (Number(w.prize) || 0), 0) || 0,
        gameSettings: gameSettings || 0,
        pendingReports: recentReports?.length || 0
      };
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('user_reports')
        .select('id, report_type, status, priority, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Erro ao carregar reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao tentar desconectar.",
        variant: "destructive",
      });
    }
  };

  const getRecentReports = () => {
    return reports.slice(0, 5);
  };

  const getSupportStats = () => {
    return {
      pending: reports.filter(r => r.status === 'pending').length,
      inProgress: reports.filter(r => r.status === 'in_progress').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      highPriority: reports.filter(r => r.priority === 'high').length,
      total: reports.length
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'bug': return 'Bug';
      case 'feature': return 'Recurso';
      case 'support': return 'Suporte';
      case 'other': return 'Outro';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Progresso';
      case 'resolved': return 'Resolvido';
      case 'closed': return 'Fechado';
      default: return status;
    }
  };

  const tabConfig = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'content', label: 'Conteúdo', icon: Gamepad2 },
    { id: 'rankings', label: 'Rankings', icon: Trophy },
    { id: 'payments', label: 'Premiação', icon: CreditCard },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'support', label: 'Suporte', icon: MessageSquare },
    { id: 'security', label: 'Segurança', icon: Shield },
  ];

  const supportStats = getSupportStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header Reformulado */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Centro de Controle</h1>
                <p className="text-slate-600 mt-1">Painel Administrativo - Letra Arena</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Sistema Online
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                <Users className="h-3 w-3 mr-2" />
                {dashboardData?.totalUsers?.toLocaleString() || mockStats.totalUsers.toLocaleString()} usuários
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                <Activity className="h-3 w-3 mr-2" />
                {mockStats.dau.toLocaleString()} DAU
              </Badge>
              {supportStats.pending > 0 && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">
                  <Clock className="h-3 w-3 mr-2" />
                  {supportStats.pending} pendentes
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Navigation Tabs Reformulada */}
          <div className="mb-8">
            <TabsList className="bg-white p-1.5 shadow-lg border border-slate-200 rounded-xl h-auto">
              {tabConfig.map((tab) => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  className="flex items-center gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-slate-50"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">{tab.label}</span>
                  {tab.id === 'support' && supportStats.pending > 0 && (
                    <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 ml-1">
                      {supportStats.pending}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Contents */}
          <div className="space-y-8">
            {/* Dashboard */}
            <TabsContent value="dashboard" className="space-y-8 mt-0">
              {/* Hero Section com estatísticas principais */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
                <div className="relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-2">
                      <h2 className="text-2xl font-bold mb-2">Visão Geral do Sistema</h2>
                      <p className="text-blue-100 mb-6">Resumo executivo de todas as áreas administrativas</p>
                      <div className="flex flex-wrap gap-4">
                        <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                          <div className="text-sm text-blue-100">Competições Ativas</div>
                          <div className="text-xl font-bold">{dashboardData?.activeCompetitions || 0}</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                          <div className="text-sm text-blue-100">Total Prêmios</div>
                          <div className="text-xl font-bold">R$ {dashboardData?.totalPrizePool?.toFixed(0) || '0'}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <Users className="h-6 w-6" />
                        <span className="font-semibold">Base de Usuários</span>
                      </div>
                      <div className="text-3xl font-bold mb-2">{(dashboardData?.totalUsers || mockStats.totalUsers).toLocaleString()}</div>
                      <div className="text-sm text-blue-100">{mockStats.dau.toLocaleString()} ativos hoje</div>
                    </div>
                    
                    <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <MessageSquare className="h-6 w-6" />
                        <span className="font-semibold">Suporte</span>
                      </div>
                      <div className="text-3xl font-bold mb-2">{supportStats.total}</div>
                      <div className="text-sm text-blue-100">{supportStats.pending} pendentes • {supportStats.resolved} resolvidos</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cards de Overview por Seção */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Conteúdo do Jogo */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-purple-500 p-3 rounded-xl">
                        <Gamepad2 className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">Configurações</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-700 mb-1">Conteúdo do Jogo</h3>
                    <div className="text-3xl font-bold text-purple-700 mb-2">{dashboardData?.gameSettings || 15}</div>
                    <p className="text-sm text-purple-600">Configurações ativas • {dashboardData?.activeCompetitions || 3} competições</p>
                  </CardContent>
                </Card>

                {/* Rankings */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-amber-500 p-3 rounded-xl">
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200">Semanal</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-700 mb-1">Rankings</h3>
                    <div className="text-3xl font-bold text-amber-700 mb-2">{dashboardData?.weeklyWinners || 45}</div>
                    <p className="text-sm text-amber-600">Ganhadores esta semana • Top 10 premiados</p>
                  </CardContent>
                </Card>

                {/* Premiação */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-green-500 p-3 rounded-xl">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200">Ativo</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-700 mb-1">Premiação</h3>
                    <div className="text-3xl font-bold text-green-700 mb-2">R$ {dashboardData?.totalPrizePool?.toFixed(0) || '2.850'}</div>
                    <p className="text-sm text-green-600">Pool de prêmios • Pagamentos automáticos</p>
                  </CardContent>
                </Card>

                {/* Usuários */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-blue-500 p-3 rounded-xl">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">Crescendo</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-700 mb-1">Gestão de Usuários</h3>
                    <div className="text-3xl font-bold text-blue-700 mb-2">{((dashboardData?.totalUsers || mockStats.totalUsers) / 1000).toFixed(1)}k</div>
                    <p className="text-sm text-blue-600">Total cadastrados • {mockStats.retention.d1}% retenção D1</p>
                  </CardContent>
                </Card>

                {/* Suporte */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-indigo-500 p-3 rounded-xl">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                      <Badge className={supportStats.pending > 0 ? "bg-red-100 text-red-700 border-red-200" : "bg-green-100 text-green-700 border-green-200"}>
                        {supportStats.pending > 0 ? "Requer Atenção" : "OK"}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-700 mb-1">Central de Suporte</h3>
                    <div className="text-3xl font-bold text-indigo-700 mb-2">{supportStats.pending}</div>
                    <p className="text-sm text-indigo-600">Tickets pendentes • {supportStats.total} total processados</p>
                  </CardContent>
                </Card>

                {/* Segurança */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-red-500 p-3 rounded-xl">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200">Seguro</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-700 mb-1">Segurança</h3>
                    <div className="text-3xl font-bold text-red-700 mb-2">98.5%</div>
                    <p className="text-sm text-red-600">Taxa de detecção • 12 bloqueios hoje</p>
                  </CardContent>
                </Card>
              </div>

              {/* Seções Detalhadas do Dashboard */}
              <div className="space-y-8">
                {/* Visão Geral de Usuários */}
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Estatísticas de Usuários
                  </h3>
                  <UserStatsCards />
                </div>

                {/* Métricas e Atividade */}
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Métricas e Atividade
                  </h3>
                  <UserMetricsGrid />
                </div>

                {/* Visão Geral de Segurança */}
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    Monitoramento de Segurança
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                      <SecurityOverview />
                    </div>
                    <div className="lg:col-span-1">
                      <SecurityMetrics />
                    </div>
                  </div>
                </div>

                {/* Seção de Suporte Detalhada */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Estatísticas de Suporte */}
                  <Card className="lg:col-span-1 border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-indigo-600" />
                        <CardTitle className="text-lg text-indigo-800">Status do Suporte</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">Pendentes</span>
                          </div>
                          <span className="text-xl font-bold text-yellow-700">{supportStats.pending}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Em Progresso</span>
                          </div>
                          <span className="text-xl font-bold text-blue-700">{supportStats.inProgress}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Resolvidos</span>
                          </div>
                          <span className="text-xl font-bold text-green-700">{supportStats.resolved}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Reports Recentes */}
                  <Card className="lg:col-span-2 border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-slate-600" />
                          <CardTitle className="text-lg text-slate-800">Reports Recentes</CardTitle>
                        </div>
                        <Badge variant="outline" className="bg-slate-100">
                          {getRecentReports().length} de {supportStats.total}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {loading ? (
                        <div className="text-center py-4 text-gray-500">Carregando reports...</div>
                      ) : getRecentReports().length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>Nenhum report encontrado</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {getRecentReports().map((report) => (
                            <div key={report.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                  {report.report_type === 'bug' ? (
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                  ) : (
                                    <MessageSquare className="h-4 w-4 text-blue-500" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-slate-800 capitalize">
                                    {getReportTypeLabel(report.report_type)}
                                  </p>
                                  <p className="text-sm text-slate-600">{formatDate(report.created_at)}</p>
                                </div>
                              </div>
                              <Badge className={getStatusColor(report.status)}>
                                {getStatusLabel(report.status)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Alertas e Status do Sistema */}
              <Card className="border-l-4 border-l-blue-500 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg text-blue-800">Status Geral do Sistema</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-green-800">Sistema Online</h4>
                        <p className="text-sm text-green-600 mt-1">Todos os serviços operacionais</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-blue-800">Dashboard Integrado</h4>
                        <p className="text-sm text-blue-600 mt-1">Todas as métricas centralizadas</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-purple-800">Competições Ativas</h4>
                        <p className="text-sm text-purple-600 mt-1">{dashboardData?.activeCompetitions || 3} em andamento</p>
                      </div>
                    </div>
                    {supportStats.pending > 0 && (
                      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium text-amber-800">Atenção: Suporte</h4>
                          <p className="text-sm text-amber-600 mt-1">{supportStats.pending} tickets pendentes</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="mt-0">
              <GameContentTab />
            </TabsContent>

            <TabsContent value="rankings" className="mt-0">
              <RankingsTab />
            </TabsContent>

            <TabsContent value="payments" className="mt-0">
              <PaymentsTab />
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              <UsersTab />
            </TabsContent>

            <TabsContent value="support" className="mt-0">
              <SupportTab />
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <SecurityTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;

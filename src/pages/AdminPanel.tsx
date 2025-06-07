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
import { BarChart3, Shield, Users, Trophy, CreditCard, Activity, TrendingUp, AlertCircle, Plus, Gamepad2, MessageSquare, Clock, CheckCircle, AlertTriangle, LogOut } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
                {mockStats.totalUsers.toLocaleString()} usuários
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
                      <p className="text-blue-100 mb-6">Acompanhe as principais métricas da plataforma em tempo real</p>
                      <div className="flex flex-wrap gap-4">
                        <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                          <div className="text-sm text-blue-100">Crescimento DAU</div>
                          <div className="text-xl font-bold">+12%</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                          <div className="text-sm text-blue-100">Meta Retenção</div>
                          <div className="text-xl font-bold">80%</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <Users className="h-6 w-6" />
                        <span className="font-semibold">Usuários Ativos</span>
                      </div>
                      <div className="text-3xl font-bold mb-2">{mockStats.dau.toLocaleString()}</div>
                      <div className="text-sm text-blue-100">Hoje • +12% vs ontem</div>
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

              {/* Cards de Métricas Detalhadas incluindo Suporte */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-emerald-500 p-3 rounded-xl">
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Ativo</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-700 mb-1">Desafios Ativos</h3>
                    <div className="text-3xl font-bold text-emerald-700 mb-2">{mockStats.activeChallenges}</div>
                    <p className="text-sm text-emerald-600">2 agendados para amanhã</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-blue-500 p-3 rounded-xl">
                        <Activity className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">Excelente</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-700 mb-1">Retenção D1</h3>
                    <div className="text-3xl font-bold text-blue-700 mb-2">{mockStats.retention.d1}%</div>
                    <p className="text-sm text-blue-600">Meta: 80% • +5% vs semana</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-amber-500 p-3 rounded-xl">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200">Crescendo</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-700 mb-1">Base de Usuários</h3>
                    <div className="text-3xl font-bold text-amber-700 mb-2">{(mockStats.totalUsers / 1000).toFixed(1)}k</div>
                    <p className="text-sm text-amber-600">+350 novos esta semana</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-purple-500 p-3 rounded-xl">
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">Semanal</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-700 mb-1">Prêmios Pagos</h3>
                    <div className="text-3xl font-bold text-purple-700 mb-2">R$ {(mockStats.revenue * 0.3).toFixed(0)}</div>
                    <p className="text-sm text-purple-600">45 ganhadores esta semana</p>
                  </CardContent>
                </Card>

                {/* Card de Suporte */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-indigo-500 p-3 rounded-xl">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                      <Badge className={supportStats.pending > 0 ? "bg-red-100 text-red-700 border-red-200" : "bg-green-100 text-green-700 border-green-200"}>
                        {supportStats.pending > 0 ? "Atenção" : "OK"}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-700 mb-1">Suporte</h3>
                    <div className="text-3xl font-bold text-indigo-700 mb-2">{supportStats.pending}</div>
                    <p className="text-sm text-indigo-600">Pendentes • {supportStats.total} total</p>
                  </CardContent>
                </Card>
              </div>

              {/* Seção de Suporte Integrada */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Estatísticas de Suporte */}
                <Card className="lg:col-span-1 border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-indigo-600" />
                      <CardTitle className="text-lg text-indigo-800">Estatísticas de Suporte</CardTitle>
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
                      
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">Alta Prioridade</span>
                        </div>
                        <span className="text-xl font-bold text-red-700">{supportStats.highPriority}</span>
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

              {/* Alertas e Notificações */}
              <Card className="border-l-4 border-l-amber-500 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <CardTitle className="text-lg text-amber-800">Alertas do Sistema</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-green-800">Sistema funcionando normalmente</h4>
                        <p className="text-sm text-green-600 mt-1">Todos os serviços operacionais - Última verificação: há 2 minutos</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-blue-800">Sistema de suporte integrado</h4>
                        <p className="text-sm text-blue-600 mt-1">Reports sendo monitorados em tempo real - {supportStats.total} reports no total</p>
                      </div>
                    </div>
                    {supportStats.pending > 5 && (
                      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium text-amber-800">Atenção: Muitos reports pendentes</h4>
                          <p className="text-sm text-amber-600 mt-1">{supportStats.pending} reports aguardando análise</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Métricas Detalhadas */}
              <MetricsTab retention={mockStats.retention} />
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
